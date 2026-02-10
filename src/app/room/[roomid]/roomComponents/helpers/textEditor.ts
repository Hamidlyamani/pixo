import Konva from "konva";

export const createTextareaForText = (textNode: any, stage: any) => {
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
  textarea.style.color = textNode.fill();
  textarea.style.border = "1px solid #eee";
  textarea.style.padding = "4px";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.background = "transparent";
  textarea.style.zIndex = "1000";

  textarea.focus();
  textNode.visible(false);
  textNode.getLayer().draw();

  const finishEditing = () => {
    textNode.text(textarea.value);
    textNode.visible(true);
    textNode.getLayer().draw();
    textarea.remove();
  };

  textarea.addEventListener("blur", finishEditing);

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
};
