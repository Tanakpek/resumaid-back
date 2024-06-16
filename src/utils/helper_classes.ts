export class HttpError extends Error {
    public code:number
    constructor(message:any, errorCode:number) {
      super(message);
      this.code = errorCode;
    }
  }
  
