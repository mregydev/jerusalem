import multiparty from 'multiparty';

import file from './file';

class Jerusalem {
    constructor(options) {
        this.files = [];
        this.options = options;
    }

    get Files() {
        return this.files;
    }

    AddFile() {
           this.files.push(new file(this.options));  
    }


    handle(form)
    {
        form.on('part',(part)=>{
             
            if(part.file){
 
            };
        });
    }
}

export default Jerusalem;