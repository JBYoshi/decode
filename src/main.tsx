import { StrictMode, useEffect, useState } from "react";
import decode from "./decoders.js";
import { DecodeNode } from "./types.js";
import { FormatNode } from "./nodes/format.js";
import { KeyValueNode } from "./nodes/keyvalue.js";
import { KeyNode } from "./nodes/key.js";
import { ListNode } from "./nodes/list.js";
import { StringNode } from "./nodes/string.js";
import { createRoot } from "react-dom/client";
import { ObjectNode } from "./nodes/object.js";

function getInitialChildren(data: DecodeNode): DecodeNode[] | null {
    if (data instanceof FormatNode) return [data.value];
    if (data instanceof KeyValueNode) return [new KeyNode("Key", data.key), new KeyNode("Value", data.value)];
    if (data instanceof ListNode) return data.elements;
    if (data instanceof ObjectNode) return data.properties.map(prop => new KeyNode(prop.description, prop.value));
    return null;
}

function TreeNode({data}: {data: DecodeNode}) {
    let prefix = "";
    if (data instanceof KeyNode) {
        prefix += data.key + ": ";
        data = data.value;
    }
    if (data instanceof FormatNode) {
        prefix += data.format + " ";
        data = data.value;
    }

    let [children, setChildren] = useState(getInitialChildren(data));
    let [expanded, setExpanded] = useState(false);
    
    useEffect(() => {
        setChildren(getInitialChildren(data) || decode(data));
    }, [data]);

    let title = prefix + data.description;
    if (data.representations.length > 0) title += ": " + data.representations[0].value;

    return <div style={{marginLeft: "1em"}} className={expanded ? "expanded" : ""}>
        <div>
            {children && children.length > 0 ? <button className="expand-button" onClick={e => {
                e.preventDefault();
                setExpanded(!expanded);
            }}>{expanded ? "-" : "+"}</button> : <div className="expand-button" />}
            <span>{title}</span>
        </div>
        { expanded ? (children || []).map(part => <TreeNode data={part} />) : [] }
    </div>;
}

addEventListener("load", function() {
    let input = document.getElementById("input") as HTMLTextAreaElement;
    let output = document.getElementById("output");

    let root = createRoot(output);
    function onInputChanged() {
        let decoded = decode(new StringNode(input.value.trim())).map(part => <TreeNode data={part} />);
        if (decoded.length == 0) decoded.push(<>Couldn't decode anything</>);
        root.render(<StrictMode>{decoded}</StrictMode>);
    }
    input.onchange = input.onkeydown = input.onkeyup = input.onpaste = function() {
        onInputChanged();
    };
    onInputChanged();
});
