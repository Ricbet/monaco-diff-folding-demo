import * as monaco from "./node_modules/monaco-editor/esm/vs/editor/editor.main.js";
import { editor } from "./node_modules/monaco-editor/esm/vs/editor/editor.main.js";

(async function () {
  const read = function (path) {
    return new Promise((resolve) => {
      fetch(path)
        .then((r) => r.text())
        .then((res) => {
          resolve(res);
        });
    });
  };

  // The diff editor offers a navigator to jump between changes. Once the diff is computed the <em>next()</em> and <em>previous()</em> method allow navigation. By default setting the selection in the editor manually resets the navigation state.
  var originalModel = monaco.editor.createModel(await read("./assets/test.js"));
  var modifiedModel = monaco.editor.createModel(
    await read("./assets/test-diff.js")
  );

  // const myeditor = monaco.editor.create(document.getElementById("container"), {
  //     value: await read("./assets/test.js"),
  //     language: "foldLanguage",
  //     codeLens: true,
  //     folding: true,
  //     showFoldingControls: "always"
  // });

  // monaco.editor.setModelLanguage(originalModel, "javascript");
  // monaco.editor.setModelLanguage(modifiedModel, "javascript");
  monaco.languages.registerFoldingRangeProvider("javascript", {
    provideFoldingRanges: function (model, context, token) {
      return [
        // comment1
        {
          start: 5,
          end: 20,
          kind: monaco.languages.FoldingRangeKind.Comment,
        },
      ];
    },
  });

  monaco.editor.create(document.getElementById("container"), {
      model: originalModel,
      folding: true
  });

  var diffEditor = monaco.editor.createDiffEditor(
    document.getElementById("diff"),
    {
      codeLens: true,
      folding: true,
      showFoldingControls: "always",
    }
  );

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  var navi = monaco.editor.createDiffNavigator(diffEditor, {
    followsCaret: true, // resets the navigator state when the user selects something in the editor
    ignoreCharChanges: true, // jump from line to line
  });

  navi.next();

  diffEditor.getModifiedEditor().getAction('editor.foldAll').run()
  diffEditor.getOriginalEditor().getAction('editor.foldAll').run()
  
})();
