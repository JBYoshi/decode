import { DateNode } from "../nodes/date";
import { FormatNode } from "../nodes/format";
import { NumberNode } from "../nodes/number";
import { DecodeNode } from "../types";

// This time in seconds is the year 2969. I doubt it'll be a problem.
const SECONDS_MILLISECONDS_CUTOFF = new Date("Jan 1, 1971, 00:00:00 UTC").getTime();

export function decodeUnixTimestamp(input: DecodeNode): DecodeNode | null {
    if (input instanceof NumberNode) {
        let timestamp = Number(input.value);
        // Could be a date.
        // For compactness, let's pick whatever's closer to now.
        if (timestamp >= SECONDS_MILLISECONDS_CUTOFF && timestamp < SECONDS_MILLISECONDS_CUTOFF * 1000) {
            return new FormatNode("UNIX timestamp (milliseconds)", new DateNode(new Date(timestamp)));
        }
        if (timestamp >= SECONDS_MILLISECONDS_CUTOFF / 1000 && timestamp < SECONDS_MILLISECONDS_CUTOFF) {
            return new FormatNode("UNIX timestamp (seconds)", new DateNode(new Date(timestamp * 1000)));
        }
    }
    return null;
}
