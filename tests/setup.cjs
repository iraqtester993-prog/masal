// Run tests consistently from the project root, even when invoked inside tests/.
const fs=require('node:fs'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
for(const dir of ['tmp','tmp/review','tmp/output/previews','tmp/output/handoff'])fs.mkdirSync(dir,{recursive:true});
