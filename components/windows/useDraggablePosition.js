import { useEffect, useRef, useState } from "react";

export default function useDraggablePosition(scale, initialPosition) {
  const [position, setPosition] = useState(initialPosition);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    baseX: initialPosition.x,
    baseY: initialPosition.y,
  });

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragRef.current.active) return;
      const dx = (event.clientX - dragRef.current.startX) / scale;
      const dy = (event.clientY - dragRef.current.startY) / scale;
      setPosition({
        x: dragRef.current.baseX + dx,
        y: dragRef.current.baseY + dy,
      });
    };

    const handlePointerUp = () => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [scale]);

  const startDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      baseX: position.x,
      baseY: position.y,
    };
  };

  return { position, startDrag, setPosition };
}


