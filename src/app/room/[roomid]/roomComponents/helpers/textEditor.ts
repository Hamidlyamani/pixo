import Konva from "konva";

export function editTextNode( textNode: Konva.Text, stage: Konva.Stage, onCommit: (value: string) => void
)  {
  const textPosition = textNode.absolutePosition();
  const stageBox = stage.container().getBoundingClientRect();

  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);

  textarea.value = textNode.text();
  textarea.style.position = "absolute";
  textarea.style.top = stageBox.top + textPosition.y + "px";
  textarea.style.left = stageBox.left + textPosition.x + "px";
  textarea.style.width = textNode.width() + "px";
  textarea.style.fontSize = textNode.fontSize() + "px";
  textarea.style.fontFamily = textNode.fontFamily();
const fill = textNode.fill();

if (typeof fill === "string") {
  textarea.style.color = fill;
} else {
  textarea.style.color = "#000";
}
  textarea.style.border = "1px solid #eee";
  textarea.style.padding = "4px";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.background = "white";
  textarea.style.zIndex = "1000";

  textarea.focus();
  textNode.visible(false);
 textNode.getLayer()?.draw();

  const finish = () => {
    const v = textarea.value;
    textarea.remove();
    textNode.visible(true);
    textNode.getLayer()?.draw();
    onCommit(v);
  };

  textarea.addEventListener("blur", finish);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textarea.blur();
    }
    if (e.key === "Escape") {
      textarea.value = textNode.text();
      textarea.blur();
    }
  });
}
