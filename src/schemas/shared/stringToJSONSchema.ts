import { z } from "zod"

export const stringToJSONSchema = z.string().optional()
    .transform( ( str, ctx ) => {
        try {
            if (!str) {
                return;
            }
            return JSON.parse( str )
        } catch ( e ) {
            ctx.addIssue( { code: 'custom', message: e.message } )
            return z.NEVER
        }
    } )