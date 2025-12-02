import { useMemo } from "react";
import s from "./VTSequence.module.css";
import { OctagonAlert } from "lucide-react";
import classNames from "classnames";

interface VTSequenceProps {
  sequence: string | [string];
  unimplemented?: boolean;
}

// Draw a diagram showing the VT sequence.
//
// There are some special sequence elements that can be used:
//
//   - CSI will be replaced with ESC [.
//   - Pn will be considered a parameter
//
export default function VTSequence({
  sequence,
  unimplemented = false,
}: VTSequenceProps) {
  const sequenceElements = useMemo(() => parseSequence(sequence), [sequence]);
  return (
    <div className={s.vtsequence}>
      {unimplemented && (
        <div className={s.unimplemented}>
          <OctagonAlert className={s.alert} size={16} />
          Unimplemented
        </div>
      )}
      <ol className={s.sequence}>
        {sequenceElements.map(({ value, hex }, i) => (
          <li key={i} className={classNames(s.vtelem, {
            [s.parameter]: hex == null
          })}>
            <dl>
              <dt>{hex ? hex : "____"}</dt>
              <dd>{value}</dd>
            </dl>
          </li>
        ))}
      </ol>
    </div>
  );
}

const special: Record<string, number> = {
  BEL: 0x07,
  BS: 0x08,
  TAB: 0x09,
  LF: 0x0a,
  CR: 0x0d,
  ESC: 0x1b,
  "...": 0,
};

function parseSequence(sequence: string | string[]) {
  let sequenceArray = typeof sequence === "string" ? [sequence] : sequence;

  if (sequenceArray[0] === "CSI") {
    sequenceArray.shift();
    sequenceArray.unshift("ESC", "[");
  } else if (sequenceArray[0] === "OSC") {
    sequenceArray.shift();
    sequenceArray.unshift("ESC", "]");
  }

  if (sequenceArray[sequenceArray.length - 1] === "ST") {
    sequenceArray.pop();
    sequenceArray.push("ESC", "\\");
  }

  return sequenceArray.map((value) => {
    // Pn is a param with name n.
    const param = value.match(/\P(\w)/)?.[1];
    if (param) return { value: param };

    // Use special lookup if it exists
    const specialChar = special[value];
    if (specialChar !== undefined) {
      if (specialChar === 0) return { value: "..." };
      const hex = specialChar.toString(16).padStart(2, "0").toUpperCase();
      return { value, hex: `0x${hex}` };
    }

    // Otherwise, encode as UTF-8
    const utf8Bytes = new TextEncoder().encode(value);
    const hex = Array.from(utf8Bytes)
      .map((byte) => `0x${byte.toString(16).padStart(2, "0").toUpperCase()}`)
      .join(" ");

    return { value, hex };
  });
}
