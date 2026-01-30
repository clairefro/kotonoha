/** Branded types */
export type UserId = string & { readonly __brand: "u_" };
export type ItemId = string & { readonly __brand: "i_" };
export type TopicId = string & { readonly __brand: "t_" };
export type HumanId = string & { readonly __brand: "h_" };
export type CommentId = string & { readonly __brand: "c_" };
export type ActivityId = string & { readonly __brand: "a_" };

/**
 * CORE INTERFACES
 */

/** minimal user interface for session communication */
export interface SessionUser {
  id: UserId;
  username: string;
  is_admin?: boolean;
}

export interface User {
  id: UserId;
  username: string;
  is_admin?: boolean;
  created_at?: string;
}

export interface Item {
  id: ItemId;
  title: string;
  source_url?: string | null;
  item_type: "book" | "article" | "essay" | "poem" | "other";
  added_by: UserId;
  created_at: string;
}

export type TagId = TopicId | HumanId;

export interface Tag {
  id: TagId;
  name: string;
  color: string;
}

export type TagOrAuthor = { id?: string; name: string; type: "tag" | "author" };

/**
 * RESPONSE TYPES
 */
export interface OkResponse {
  ok: boolean;
}

export interface ErrorResponse {
  status: string;
  message?: string;
}

export interface UsersEmptyResponse {
  empty: boolean;
}

/**
 * ACTIVITY & NOTIFICATIONS
 */
export type ActionType =
  | "user_login"
  | "item_added"
  | "item_deleted"
  | "comment_created"
  | "tag_applied"
  | "tag_removed";

export interface Activity {
  id: ActivityId;
  user_id: UserId;
  action_type: ActionType;
  entity_id: ItemId | CommentId | TagId;
  entity_type: "item" | "comment" | "tag";
  created_at: string;
}

export interface ActivityReceipt {
  activity_id: ActivityId;
  user_id: UserId;
  seen_at: string;
}

/**
 * HYDRATED RESPONSE TYPES
 */
export interface ItemWithMeta extends Item {
  tags?: Tag[];
  authors?: Tag[];
}
