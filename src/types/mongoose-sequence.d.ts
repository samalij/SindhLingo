declare module 'mongoose-sequence' {
    import { Mongoose, Schema } from 'mongoose';
  
    interface AutoIncrementOptions {
      inc_field?: string;
      id?: string;
      start_seq?: number;
      disable_hooks?: boolean;
    }
  
    function mongooseSequence(mongoose: Mongoose): (schema: Schema, options?: AutoIncrementOptions) => void;
  
    export = mongooseSequence;
  }