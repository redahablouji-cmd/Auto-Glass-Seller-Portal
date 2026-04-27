import { supabase } from '../supabase';

export const discussionService = {
  
  // 1. Fetch the Inbox (Used by Seller to see Buyers)
  async getInbox() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Step A: Fetch the raw discussions
    const { data: discussions, error } = await supabase
      .from('discussions')
      .select('*')
      .or(`buyer_id.eq.${user.id},supplier_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error || !discussions) {
      console.error("Error fetching inbox:", error?.message);
      return [];
    }

    // Step B: Enrich the data (The Promise.all section!)
    const enrichedDiscussions = await Promise.all(discussions.map(async (chat) => {
      
      // Grab the BUYER'S Business Name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_name')
        .eq('user_id', chat.buyer_id) 
        .single();

      if (profileError) console.error("PROFILE FETCH ERROR:", profileError);

      // Grab the actual Part Reference Code
      const { data: item, error: itemError } = await supabase
        .from('live_inventory')
        .select('reference_code')
        .eq('inventory_id', chat.offer_id)
        .single();

      if (itemError) console.error("INVENTORY FETCH ERROR:", itemError);

      // Combine it all together
      return {
        ...chat,
        business_name: profile?.business_name || `Buyer ID: ${chat.buyer_id?.substring(0,8)}`,
        reference_code: item?.reference_code || `REF: ${chat.offer_id?.substring(0,8)}`
      };
    }));

    return enrichedDiscussions;
  },

  // 2. Load a Specific Discussion Timeline
  async getMessages(discussionId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error.message);
      return [];
    }
    return data;
  },

  // 3. Send a Message OR an Official Offer
  // 3. Send a Message
  // Notice the V2!
  async sendMessageV2(discussionId: string, content: string, type: 'text' | 'formal_offer' = 'text', fileUrl: string | null = null, replyToId: string | null = null) {
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        discussion_id: discussionId,
        sender_id: user.id,
        content: content,
        message_type: type,
        file_url: fileUrl,
        reply_to_id: replyToId
      }]);

    if (error) console.error("Error sending message:", error);
    return data;
  },

  // 4. Find or Create a Room (The BUYER uses this when clicking "Contact Supplier")
  async findOrCreateDiscussion(offerId: string, supplierId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if room exists
    const { data: existingRoom } = await supabase
      .from('discussions')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('supplier_id', supplierId)
      .eq('offer_id', offerId)
      .single();

    if (existingRoom) return existingRoom;

    // If not, create it
    const { data: newRoom, error } = await supabase
      .from('discussions')
      .insert([{
          buyer_id: user.id,
          supplier_id: supplierId,
          offer_id: offerId,
          status: 'active'
      }])
      .select()
      .single();

    if (error) console.error("Error creating discussion:", error.message);
    return newRoom;
  },

  // 5. Upload File (Invoices, Photos)
  async uploadFile(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('discussion-files')
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    const { data } = supabase.storage.from('discussion-files').getPublicUrl(fileName);
    return data.publicUrl;
  },
  // Add this right before the final closing brace in discussionService.ts

  // UPGRADED: Listen for BOTH new messages AND status updates (blue ticks)
  subscribeToMessages(discussionId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`chat-${discussionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `discussion_id=eq.${discussionId}` },
        (payload) => callback(payload)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },
  async uploadFile(file: File, discussionId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${discussionId}/${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('discussion-files') // <--- Updated to your real bucket!
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('discussion-files') // <--- Updated here too!
      .getPublicUrl(fileName);

    return publicUrl;
  },
// NEW: Mark messages as read when the user opens the chat
  async markMessagesAsRead(discussionId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update all messages in this chat where I am NOT the sender, and status is not 'read'
    const { error } = await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('discussion_id', discussionId)
      .neq('sender_id', user.id)
      .neq('status', 'read');

    if (error) console.error("Error updating message status:", error);
  },
  // UPDATE: Add fileUrl to the sendMessage payload
  async sendMessage(discussionId: string, content: string, type: 'text' | 'formal_offer' = 'text', fileUrl: string | null = null) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert([{
          discussion_id: discussionId,
          sender_id: user.id,
          content: content,
          message_type: type,
          file_url: fileUrl // <-- Ensure your 'messages' table has this column
      }])
      .select();

    if (error) return null;
    return data;
  }
};