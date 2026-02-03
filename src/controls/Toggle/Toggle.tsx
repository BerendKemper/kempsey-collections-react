
import "./Toggle.css";

interface ToggleProps extends React.HTMLAttributes<HTMLElement> {
  storage: Storage
  storageKey: string
}

export function Toggle({ className, storage, storageKey }: ToggleProps) {
  let storedValue = storage[storageKey] === `true` ? true : false;
  if (storedValue) {
    storage[storageKey] = String(storedValue);
    document.documentElement.classList.add(storageKey);
  }
  console.log(storage);
  return <button id={storageKey} className={`toggle ${className}`} onClick={() => {
    storage[storageKey] = String(storedValue = !storedValue);
    document.documentElement.classList.toggle(storageKey);
  }}></button >;
}
