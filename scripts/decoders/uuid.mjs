export default function decodeUUID(input) {
    if (typeof input != "string") return null;

    if (input.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || input.match(/^[0-9a-f]{32}$/)) {
        let hasUuidDashes = input.includes("-");
        input = input.replace(/-/g, "");
        let version = input[12];
        let variant = parseInt(input[16], 16) >> 1;

        const UUID_VARIANTS = [
            "NCS", // 000
            "NCS", // 001
            "NCS", // 010
            "NCS", // 011
            "ISO", // 100
            "ISO", // 101
            "Microsoft", // 110
            "ISO", // 111
        ];

        let title = "UUID";
        let versionData = null;
        const children = [
            {
                title: "Variant",
                value: UUID_VARIANTS[variant],
                children: []
            },
            {
                title: "Version",
                value: "PLACEHOLDER"
            }
        ];

        if (input == "00000000000000000000000000000000") {
            versionData = "Nil UUID";
        } else if (input == "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF") {
            versionData = "Max UUID";
        } else if (variant == 0b100 || variant == 0b101) {
            // ISO case.
            // 111 is also allocated to ISO, but it isn't used currently.

            if ((version == "1" || version == "2" || version == "6")) {
                if (version == "1") {
                    versionData = "Time-based, Gregorian";
                } else if (version == "2") {
                    versionData = "DCE";
                } else if (version == "6") {
                    versionData = "Time-based, Gregorian reordered"
                }

                children.push({
                    title: "Node ID",
                    value: input.substring(20)
                });
                
                let timestamp;
                if (version == "6") {
                    timestamp = BigInt(parseInt(input.substring(0, 12) + input.substring(13, 16), 16));
                } else {
                    let timeHigh = BigInt(parseInt(input.substring(13, 16), 16));
                    let timeMid = BigInt(parseInt(input.substring(8, 12), 16));
                    let timeLow = BigInt(parseInt(input.substring(0, 8), 16));
                    timestamp = (timeHigh << 48n | timeMid << 32n | timeLow);
                }

                let clock = parseInt(input.substring(16, 20), 16) & 0x3FFF;

                if (version == "2") {
                    let domain = clock & 0xFF;
                    if (domain == 0) {
                        domain += " (POSIX user)";
                    } else if (domain == 1) {
                        domain += " (POSIX group)";
                    }
                    children.push({
                        title: "Local domain",
                        value: domain
                    });
                    clock >>= 8; // TODO: not sure what the convention is

                    let uid = Number(timestamp & 0xFFFFFFFFn);
                    children.push({
                        title: "Local ID",
                        value: uid
                    });
                    timestamp &= 0xFFFFFFFF00000000n;
                }

                children.push({
                    title: "Clock sequence",
                    value: clock
                });

                let uuidEpoch = new Date("October 15, 1582, 00:00:00 UTC").getTime();
                children.push({
                    title: "Timestamp",
                    value: (version == "2" ? timestamp / 0x100000000n : timestamp),
                    children: decode(new Date(Number(timestamp / 10000n) + uuidEpoch))
                });
            }
            if (version == "4") {
                versionData = "Random";
            }
            if (version == "3" || version == "5") {
                if (version == "3") {
                    versionData = "Name-based, MD5";
                } else if (version == "5") {
                    versionData = "Name-based, SHA-1";
                }
            }
            if (version == "7") {
                versionData = "Time-based, UNIX";
                let timestamp = parseInt(input.substring(0, 12), 16);
                children.push({
                    title: "Timestamp",
                    value: timestamp,
                    children: decode(new Date(timestamp))
                });
            }
            if (version == "8") {
                versionData = "Custom";
            }
        }

        if (versionData) {
            children[1].value = version + " (" + versionData + ")";
        } else {
            if (!hasUuidDashes) {
                // Probably not a UUID after all
                return null;
            }
            children[1].value = version + " (Unknown)";
        }

        let reformatted = input.slice(0, 8) + "-" + input.slice(8, 12) + "-" + input.slice(12, 16) + "-" + input.slice(16, 20) + "-" + input.slice(20, 32);

        return {
            title,
            value: reformatted,
            children
        };
    }
}