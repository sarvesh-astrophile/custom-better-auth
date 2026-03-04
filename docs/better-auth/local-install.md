Features

Own your auth.

Local install gives you full control over your Better Auth schema, allows schema related configuration to work, and makes it possible to use plugins beyond those [supported](https://labs.convex.dev/better-auth/supported-plugins) for Convex + Better Auth. It also allows you to write Convex functions that directly access Better Auth component tables.

With this approach, the Better Auth plugin is defined in it's own Convex subdirectory. Installation is a bit different from the default approach, and includes a schema generation step via Better Auth CLI, similar to the installation experience with other providers.

Before you begin, follow the [Getting Started](https://labs.convex.dev/better-auth) guide to set up Convex + Better Auth for your project. Then return here to walk through converting the default install to a local install.

### [Create the component definition](#create-the-component-definition)

Create a `convex/betterAuth/convex.config.ts` file to define the component. This will signal to Convex that the `convex/betterAuth` directory is a locally installed component.

    import { defineComponent } from "convex/server";
    
    const component = defineComponent("betterAuth");
    
    export default component;

### [Generate the schema](#generate-the-schema)

Add a static `auth` export to the `convex/betterAuth/auth.ts` file.

This file should _only_ have your `auth` export for schema generation, and no other code. If this file is imported at runtime it will trigger errors due to missing environment variables.

    import { createAuth } from '../auth'
    
    // Export a static instance for Better Auth schema generation
    export const auth = createAuth({} as any)

Generate the schema for the component.

    cd convex/betterAuth
    npx @better-auth/cli generate -y

### [Split out `createAuthOptions` function](#split-out-createauthoptions-function)

Code in your component directory needs access to your Better Auth options, but running `createAuth()` inside of your component directory will trigger errors from Better Auth due to lack of environment variable access.

To avoid this, you'll want to have a separate `createAuthOptions` function that just returns the typed options object.

    import {
      betterAuth,
      type BetterAuthOptions, 
    } from "better-auth/minimal";
    
    export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
      return {
        // ... auth config
      } satisfies BetterAuthOptions;
    };
    
    export const createAuth = (ctx: GenericCtx<DataModel>) => {
      return betterAuth({
        // ... auth config
      });
      return betterAuth(createAuthOptions(ctx)); 
    };

### [Export adapter functions](#export-adapter-functions)

Export adapter functions for the component.

    import { createApi } from "@convex-dev/better-auth";
    import schema from "./schema";
    import { createAuthOptions } from "../auth";
    
    export const {
      create,
      findOne,
      findMany,
      updateOne,
      updateMany,
      deleteOne,
      deleteMany,
    } = createApi(schema, createAuthOptions);

### [Update component registration](#update-component-registration)

Update component registration to use the locally installed component.

    import { defineApp } from "convex/server";
    import betterAuth from "@convex-dev/better-auth/convex.config"; 
    import betterAuth from "./betterAuth/convex.config"; 
    
    const app = defineApp();
    app.use(betterAuth);
    
    export default app;

### [Update component config](#update-component-config)

Update the component client config to use the local schema.

    import authSchema from "./betterAuth/schema"; 
    
    // ...
    
    export const authComponent = createClient<DataModel>(components.betterAuth); 
    export const authComponent = createClient<DataModel, typeof authSchema>( 
      components.betterAuth,
      {
        local: {
          schema: authSchema,
        },
      }
    );
    
    // ...

### [You're done!](#youre-done)

The Better Auth component and schema are now locally defined in your Convex project.

### [Updating the schema](#updating-the-schema)

Certain options changes may require schema generation. The Better Auth docs will often note when this is the case. To regenerate the schema at any time (as it's generally safe to do), move into the component directory and run the Better Auth CLI generate command.

    cd convex/betterAuth
    npx @better-auth/cli generate -y

### [Adding custom indexes](#adding-custom-indexes)

Some database interactions through Better Auth may run queries that don't use an index. The Better Auth component automatically selects a suitable index for a given query if one exists, and will log a warning indicating what index should be added.

Custom indexes can be added by generating the schema to a secondary file, importing it `convex/betterAuth/schema.ts` and adding the indexes. This way custom indexes aren't overwritten when the schema is regenerated.

Schema table names and fields should not be customized directly, as any customizations won't match your Better Auth configuration, and will be overwritten when the schema is regenerated. Instead, Better Auth schema can be [customized through options](https://www.better-auth.com/docs/concepts/database#core-schema).

#### [Generate the schema](#generate-the-schema-1)

Generate the schema to a secondary file.

    cd convex/betterAuth
    npx @better-auth/cli generate -y --output generatedSchema.ts

#### [Update the final schema](#update-the-final-schema)

Delete the contents of `schema.ts` and replace with table definitions from the generated schema.

    import { defineSchema } from "convex/server";
    import { tables } from "./generatedSchema";
    
    const schema = defineSchema({
      ...tables,
      // Spread the generated schema and add a custom index
      user: tables.user.index("custom_index", ["field1", "field2"]),
    });
    
    export default schema;

### [Accessing component data](#accessing-component-data)

Convex functions within your Better Auth component directory can access the component's tables directly, and can then be run from outside the component via `ctx.runQuery`, `ctx.runMutation`, or `ctx.runAction`.

Note that if an internal function is defined in a component, it will not be accessible from outside the component, so functions that need to run outside the component cannot be internal. While normally public functions are exposed to the internet, **Convex functions exported by a component are never exposed to the internet, even if they are public**.

Return validators

If a function in a component is called from outside the component, the return type won't be inferred unless a return validator is provided.

    import { query, mutation } from "./_generated/server";
    import { doc } from "convex-helpers/validators";
    import schema from "./schema";
    import { v } from "convex/values";
    
    // This is accessible from outside the component
    export const someFunction = query({
      args: { sessionId: v.id("session") },
      // Add a return validator so the return value is typed when
      // called from outside the component.
      returns: v.union(v.null(), doc(schema, "session")),
      handler: async (ctx, args) => {
        return await ctx.db.get(args.sessionId);
      },
    });
    
    // This is not accessible from outside the component.
    export const someInternalFunction = internalQuery({
      args: { sessionId: v.id("session") },
      handler: async (ctx, args) => {
        return await ctx.db.get(args.sessionId);
      },
    });

These functions can now be called from a parent component (or app).

    import { query } from "./_generated/server";
    import { components } from "./_generated/api";
    import { v } from "convex/values";
    
    export const someFunction = query({
      args: { sessionId: v.id("session") },
      handler: async (ctx, args) => {
        return await ctx.runQuery(components.betterAuth.someFile.someFunction, {
          sessionId: args.sessionId,
        });
      },
    });
