const fs=require('fs');function edit(f,fn){fs.writeFileSync(f,fn(fs.readFileSync(f,'utf8')))}
edit('index.html',s=>s.replace('<operations-panel ref="operations">','<completion-panel ref="completion"></completion-panel><operations-panel ref="operations">').replace('<script src="workflow-ui.js"></script>','<script src="workflow-ui.js"></script><script src="completion-engine.js"></script><script src="completion-ui.js"></script>'));
edit('app.js',s=>s.replace('MasalWorkflowUI.install(appOptions);','MasalWorkflowUI.install(appOptions);\nMasalCompletionUI.install(appOptions);'));
edit('build.cjs',s=>s.replace("'workflow-ui.js','locales.js'","'workflow-ui.js','completion-engine.js','completion-ui.js','locales.js'"));
edit('engine.js',s=>s+"\nif(typeof module!=='undefined')require('./completion-engine.js');\n");
edit('completion-ui.js',s=>s.replace('class="modalbackdrop security-dialog"','class="overlay security-dialog"'));
fs.appendFileSync('operations.css','\n.security-dialog{z-index:2000}.security-dialog .modal{max-height:90vh;overflow:auto}.security-dialog .formgrid{margin:18px 0}.security-dialog .modal>label{margin:14px 0}\n');
