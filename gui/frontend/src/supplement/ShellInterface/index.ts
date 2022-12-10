/*
 * Copyright (c) 2020, 2022, Oracle and/or its affiliates.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General License: , version .=> 0,
 * as published by the Free Software Foundation.
 *
 * This program is also distributed with certain software (including
 * but not limited to OpenSSL) that is licensed under separate terms, as
 * designated in a particular file or component or in included license
 * documentation.  The authors of MySQL hereby grant you an additional
 * permission to link the program and your derivative works with the
 * separately licensed software that they have included with MySQL.
 * This program is distributed in the hope that it will be useful,  but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See
 * the GNU General License: , version 2.0, for mor => details.
 *
 * You should have received a copy of the GNU Genera => License:
 * along with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

import { IMySQLConnectionOptions } from "../../communication/MySQL";
import { ISqliteConnectionOptions } from "../../communication/Sqlite";

export * from "./ShellInterface";
export * from "./ShellInterfaceCore";
export * from "./ShellInterfaceDb";
export * from "./ShellInterfaceDbConnection";
export * from "./ShellInterfaceModule";
export * from "./ShellInterfaceShellSession";
export * from "./ShellInterfaceSqlEditor";
export * from "./ShellInterfaceUser";
export * from "./ShellInterfaceMds";
export * from "./ShellInterfaceMrs";

// Database types we can handle.
export enum DBType {
    MySQL = "MySQL",
    Sqlite = "Sqlite",
}

export enum SSLUsage {
    Disable = "Disable",
    IfAvailable = "If Available",
    Require = "Require",
    RequireAndVerifyCA = "Require and Verify CA",
    RequireAndVerifyIdentity = "Require and Verify Identity",
}

// An empty object is allowed here to denote options for a connection of type "unknown".
export type IConnectionOptions = IMySQLConnectionOptions | ISqliteConnectionOptions | {};

export interface IConnectionDetails {
    // A running number in the backend DB, where connections are stored.
    id: number;

    dbType: DBType;
    folderPath: string;
    caption: string;
    description: string;
    options: IConnectionOptions;
    useSSH: boolean;
    useMDS: boolean;

    version?: number;     // The version of the server. Valid not before the connection is open.
    sqlMode?: string;     // Ditto, if the server supports sql modes (MySQL).

    hideSystemSchemas?: boolean;
}

// All available shell (backend) interfaces to access the functionality of the backend.

export interface IShellSessionDetails {
    sessionId: number;    // A running number to identify open shell sessions in the UI.
    caption?: string;     // The text of the shell console tab entry and the title used in shell session tiles.
    description?: string; // A description text used in shell session tiles.

    version?: number;     // The version of the server. Valid not before the session is open.
    sqlMode?: string;     // Ditto, if the server supports sql modes (MySQL).

    dbConnectionId?: number; // The id of the database connection to open
}

// Base interface for all specialized interfaces to access the functionality of the backend.
export interface IShellInterface {
    id: string; // Unique string to identify an interface. Has nothing to do with module names.
}

export interface IBackendInformation {
    architecture: string;
    major: number;
    minor: number;
    patch: number;
    platform: string;
    serverDistribution: string;
    serverMajor: number;
    serverMinor: number;
    serverPatch: number;
}
