/* eslint-disable */
/**
 * Generated data model bindings for the RadioWave schema.
 */
import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
} from "convex/server";
import schema from "../schema";

export type TableNames = TableNamesInDataModel<typeof schema>;
export type Doc<TableName extends TableNames> = DocumentByName<typeof schema, TableName>;
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
