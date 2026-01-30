// ItemService: Business logic for items
import { ItemDAO } from "../daos/ItemDAO";
import { TagAuthorDAO } from "../daos/TagAuthorDAO";
import { Item, TagOrAuthor } from "shared-types";

export class ItemService {
  constructor(private db: any) {
    this.itemDAO = new ItemDAO(db);
    this.tagAuthorDAO = new TagAuthorDAO(db);
  }
  private itemDAO: ItemDAO;
  private tagAuthorDAO: TagAuthorDAO;

  async getItemById(id: string): Promise<Item | null> {
    const row = await this.itemDAO.getById(id);
    if (!row) return null;
    return this.rowToItem(row);
  }

  async getAllItems(): Promise<Item[]> {
    const rows = await this.itemDAO.getAll();
    return rows.map(this.rowToItem);
  }

  async createItem(data: {
    id: string;
    title: string;
    source_url: string | null;
    item_type: string;
    added_by: string;
    tags?: TagOrAuthor[];
    authors?: TagOrAuthor[];
  }): Promise<Item> {
    const { tags = [], authors = [], ...itemData } = data;
    const row = await this.itemDAO.insert(itemData);
    // Upsert tags/authors
    const tagIds = [];
    for (const tag of tags) {
      const tagId = await this.tagAuthorDAO.upsertTagOrAuthor({
        ...tag,
        type: "tag",
      });
      tagIds.push(tagId);
    }
    const authorIds = [];
    for (const author of authors) {
      const authorId = await this.tagAuthorDAO.upsertTagOrAuthor({
        ...author,
        type: "author",
      });
      authorIds.push(authorId);
    }
    await this.tagAuthorDAO.addEntityTags(row.id, tagIds);
    await this.tagAuthorDAO.addItemAuthors(row.id, authorIds);
    return this.rowToItem(row);
  }

  async updateItem(
    id: string,
    updates: Partial<{
      title: string;
      source_url: string | null;
      item_type: string;
    }>,
  ): Promise<Item | null> {
    const row = await this.itemDAO.update(id, updates);
    if (!row) return null;
    return this.rowToItem(row);
  }

  async deleteItem(id: string) {
    return this.itemDAO.delete(id);
  }

  async getAddedBy(id: string) {
    return this.itemDAO.getAddedBy(id);
  }

  private rowToItem(row: any): Item {
    return {
      id: row.id,
      title: row.title,
      source_url: row.source_url,
      item_type: row.item_type,
      added_by: row.added_by,
      created_at: row.created_at,
    };
  }
}
