import * as monaco from "./node_modules/monaco-editor/esm/vs/editor/editor.main.js";
import { editor } from "./node_modules/monaco-editor/esm/vs/editor/editor.main.js";

const sleep = (time) => {
  return new Promise((res) => {
    setTimeout();
  });
};

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

  monaco.editor.setModelLanguage(originalModel, "javascript");
  monaco.editor.setModelLanguage(modifiedModel, "javascript");
  monaco.languages.registerFoldingRangeProvider("javascript", {
    provideFoldingRanges: function (model, context, token) {
      // return Array.from({ length: 10 }).map((e, i) => {
      //   if (i % 2 == 0) return [];
      //   return {
      //     start: i,
      //     end: i + 1,
      //     kind: monaco.languages.FoldingRangeKind.Comment,
      //   };
      // });
      return [
        {
          start: 10,
          end: 19,
          kind: monaco.languages.FoldingRangeKind.Comment,
        },
      ];
    },
  });

  // var diffEditor = monaco.editor.create(document.getElementById("container"), {
  //   model: originalModel,
  //   folding: true,
  // });

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

  const commandId = diffEditor.addCommand(
    76,
    function ({ get }, model, token) {
      const foldingController = diffEditor
        .getModifiedEditor()
        .getContribution("editor.contrib.folding");
      const foldingModel = foldingController.foldingModel;
      foldingModel.toggleCollapseState([
        {
          endLineNumber: 19,
          index: 0,
          isCollapsed: true,
          parentIndex: -1,
          regionIndex: 0,
          startLineNumber: 10,
        },
      ]);
      foldingController.foldingModel.toggleCollapseState();
      console.log("hello 哇", foldingController.foldingModel);
    },
    ""
  );

  monaco.languages.registerCodeLensProvider("javascript", {
    provideCodeLenses: function (model, token) {
      return [
        {
          range: {
            startLineNumber: 20,
            startColumn: 1,
            endLineNumber: 26,
            endColumn: 2,
          },
          id: "fold all",
          command: {
            id: commandId,
            title: "收起全部",
            arguments: [model, token],
          },
        },
        {
          range: {
            startLineNumber: 20,
            startColumn: 1,
            endLineNumber: 26,
            endColumn: 2,
          },
          id: "fold 20",
          command: {
            id: commandId,
            title: "向上展开 20 行",
          },
        },
      ];
    },
    resolveCodeLens: function (model, codeLens, token) {
      console.log(codeLens, "token", model);
      return codeLens;
    },
  });

  const modified = diffEditor.getModifiedEditor();
  const original = diffEditor.getOriginalEditor();

  // modified.getAction("editor.foldAll").run();
  // original.getAction("editor.foldAll").run();
})();
