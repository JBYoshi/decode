// This time in seconds is the year 2969. I doubt it'll be a problem.
const SECONDS_MILLISECONDS_CUTOFF = new Date("Jan 1, 1971, 00:00:00 UTC").getTime();

export function decodeUnixTimestamp(input) {
    if (typeof input == "string" && input.match(/^[0-9]+$/)) {
        input = parseInt(input);
    }
    if (typeof input == "number") {
        // Could be a date.
        // For compactness, let's pick whatever's closer to now.
        if (input >= SECONDS_MILLISECONDS_CUTOFF && input < SECONDS_MILLISECONDS_CUTOFF * 1000) {
            return {
                title: "UNIX timestamp (milliseconds)",
                value: new Date(input)
            };
        }
        if (input >= SECONDS_MILLISECONDS_CUTOFF / 1000 && input < SECONDS_MILLISECONDS_CUTOFF) {
            return {
                title: "UNIX timestamp (seconds)",
                value: new Date(input * 1000)
            };
        }
    }
    return null;
}