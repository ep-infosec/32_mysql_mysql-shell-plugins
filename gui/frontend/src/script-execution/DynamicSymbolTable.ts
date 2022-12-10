/*
 * Copyright (c) 2021, 2022, Oracle and/or its affiliates.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 2.0,
 * as published by the Free Software Foundation.
 *
 * This program is also distributed with certain software (including
 * but not limited to OpenSSL) that is licensed under separate terms, as
 * designated in a particular file or component or in included license
 * documentation. The authors of MySQL hereby grant you an additional
 * permission to link the program and your derivative works with the
 * separately licensed software that they have included with
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See
 * the GNU General Public License, version 2.0, for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import { Symbol, ScopedSymbol, SymbolTableOptions } from "antlr4-c3";

import { ShellInterfaceDb } from "../supplement/ShellInterface";
import {
    CharsetSymbol, CollationSymbol, ColumnSymbol, DBSymbolTable, EngineSymbol, ForeignKeySymbol, IndexSymbol,
    LogfileGroupSymbol, PluginSymbol, SchemaSymbol, StoredFunctionSymbol, StoredProcedureSymbol, TableSymbol,
    TriggerSymbol, UdfSymbol, UserSymbol, UserVariableSymbol, ViewSymbol,
} from "../parsing/DBSymbolTable";
import { SymbolKind } from "../parsing/parser-common";

// An enhanced database symbol table, which is able to retrieve their content from a shell DB connection on demand.
export class DynamicSymbolTable extends DBSymbolTable {

    public constructor(
        private backend: ShellInterfaceDb | undefined,
        name: string,
        options: SymbolTableOptions) {
        super(name, options);
    }

    /**
     * Overwritten to provide dynamic loading of global symbols like schemas, engines, etc.
     *
     * @param t The symbol type to load.
     * @param localOnly Indicates the locality of the symbol search.
     *
     * @returns A set of found symbols.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async getAllSymbols<T extends Symbol>(t: new (...args: any[]) => T, localOnly?: boolean): Promise<T[]> {
        let existing = await super.getAllSymbols(t, localOnly);
        if (existing.length === 0) {
            // Not yet loaded, so do it now.
            await this.loadSymbolsOfKind(this, DBSymbolTable.getKindFromSymbol(t.name));
            existing = await super.getAllSymbols(t, localOnly);
        }

        return existing;
    }

    /**
     * Sends a request to the backend to return certain object names and creates symbols for them.
     *
     * @param parent The parent symbol to fill new nodes in.
     * @param kind The type of symbol to retrieve.
     *
     * @returns The list of new symbols that have been added to this symbol table.
     */
    public async loadSymbolsOfKind(parent: ScopedSymbol, kind: SymbolKind): Promise<Set<Symbol>> {
        if (!this.backend) {
            return new Set();
        }

        switch (kind) {
            case SymbolKind.Schema: {
                const data = await this.backend.getCatalogObjects("Schema");
                this.handleResults(data, parent, SchemaSymbol);

                break;
            }

            case SymbolKind.Table: {
                const data = await this.backend.getSchemaObjects(parent.name, "Table");
                this.handleResults(data, parent, TableSymbol);

                break;
            }

            case SymbolKind.Column: {
                if (parent.parent) {
                    const data = await this.backend.getTableObjects(parent.parent.name, parent.name, "Column");
                    this.handleResults(data, parent, ColumnSymbol);
                }

                break;
            }

            case SymbolKind.Procedure: {
                const data = await this.backend.getSchemaObjects(parent.name, "Routine", "procedure");
                this.handleResults(data, parent, StoredProcedureSymbol);

                break;
            }

            case SymbolKind.Function: {
                const data = await this.backend.getSchemaObjects(parent.name, "Routine", "function");
                this.handleResults(data, parent, StoredFunctionSymbol);

                break;
            }

            case SymbolKind.Udf: {
                const data = await this.backend.getSchemaObjects(parent.name, "Routine");
                this.handleResults(data, parent, UdfSymbol);

                break;
            }

            case SymbolKind.View: {
                const data = await this.backend.getSchemaObjects(parent.name, "View");
                this.handleResults(data, parent, ViewSymbol);

                break;
            }

            case SymbolKind.PrimaryKey: {
                if (parent.parent) {
                    const data = await this.backend.getTableObjects(parent.parent.name, parent.name, "Primary Key");
                    this.handleResults(data, parent, ForeignKeySymbol);
                }

                break;
            }

            case SymbolKind.ForeignKey: {
                if (parent.parent) {
                    const data = await this.backend.getTableObjects(parent.parent.name, parent.name, "Foreign Key");
                    this.handleResults(data, parent, ForeignKeySymbol);
                }

                break;
            }

            case SymbolKind.Operator: {

                break;
            }

            case SymbolKind.Engine: {
                const data = await this.backend.getCatalogObjects("Engine");
                this.handleResults(data, parent, EngineSymbol);

                break;
            }

            case SymbolKind.Trigger: {
                const data = await this.backend.getSchemaObjects(parent.name, "Trigger");
                this.handleResults(data, parent, TriggerSymbol);

                break;
            }

            case SymbolKind.LogfileGroup: {
                const data = await this.backend.getSchemaObjects(parent.name, "Routine");
                this.handleResults(data, parent, LogfileGroupSymbol);

                break;
            }

            case SymbolKind.UserVariable: {
                const data = await this.backend.getCatalogObjects("User Variable");
                this.handleResults(data, parent, UserVariableSymbol);

                break;
            }

            case SymbolKind.Tablespace: {
                const data = await this.backend.getSchemaObjects(parent.name, "Tablespace");
                this.handleResults(data, parent, UdfSymbol);

                break;
            }

            case SymbolKind.Event: {
                const data = await this.backend.getSchemaObjects(parent.name, "Event");
                this.handleResults(data, parent, UdfSymbol);

                break;
            }

            case SymbolKind.Index: {
                if (parent.parent) {
                    const data = await this.backend.getTableObjects(parent.parent.name, parent.name, "Index");
                    this.handleResults(data, parent, IndexSymbol);
                }

                break;
            }

            case SymbolKind.User: {
                const data = await this.backend.getCatalogObjects("User");
                this.handleResults(data, parent, UserSymbol);

                break;
            }

            case SymbolKind.Charset: {
                const data = await this.backend.getCatalogObjects("Character Set");
                this.handleResults(data, parent, CharsetSymbol);

                break;
            }

            case SymbolKind.Collation: {
                const data = await this.backend.getCatalogObjects("Collation");
                this.handleResults(data, parent, CollationSymbol);

                break;
            }

            case SymbolKind.Plugin: {
                const data = await this.backend.getCatalogObjects("Plugin");
                this.handleResults(data, parent, PluginSymbol);

                break;
            }

            // Everything else can either not be loaded (e.g. catalog) or exists already somewhere else
            // (e.g. system functions and keywords).
            default:
        }

        return new Set();
    }

    /**
     * Common handling of object listing results from the backend.
     *
     * @param names The result data to process.
     * @param parent The parent symbol where to add new symbols.
     * @param t The type of the symbol to add.
     */
    private handleResults<T extends Symbol>(names: string[], parent: ScopedSymbol,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        t: new (...args: any[]) => T): void {

        const symbolNames: string[] = [];
        /*if (names.names) {
            names.names.forEach((item) => {
                symbolNames.push(item);
            });
        } else if (names.columns) {
            names.columns.columns.forEach((item) => {
                symbolNames.push(item);
            });
        }*/
        names.forEach((item) => {
            symbolNames.push(item);
        });

        const symbols: Set<T> = new Set();
        symbolNames.forEach((symbolName) => {
            symbols.add(this.addNewSymbolOfType(t, parent, symbolName));
        });
    }
}