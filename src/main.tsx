import { StrictMode, useEffect, useRef, useState } from "react";
import decode from "./decoders.js";
import { DecodeNode, Representation } from "./types.js";
import { FormatNode } from "./nodes/format.js";
import { KeyValueNode } from "./nodes/keyvalue.js";
import { KeyNode } from "./nodes/key.js";
import { ListNode } from "./nodes/list.js";
import { StringNode } from "./nodes/string.js";
import { createRoot } from "react-dom/client";
import { ObjectNode } from "./nodes/object.js";
import { StandardProperties } from "csstype";

function getInitialChildren(data: DecodeNode): (DecodeNode | KeyNode)[] | null {
    if (data instanceof FormatNode) return [data.value];
    if (data instanceof KeyValueNode) return [new KeyNode("Key", data.key), new KeyNode("Value", data.value)];
    if (data instanceof ListNode) return data.elements;
    if (data instanceof ObjectNode) return data.properties.map(prop => new KeyNode(prop.description, prop.value));
    return null;
}

function Representer({representations}: {representations: Representation[]}) {
    let [selectedIndex, setSelectedIndex] = useState(0);
    let [showAll, setShowAll] = useState(false);
    let viewRef = useRef<HTMLSelectElement>();

    if (representations.length == 0) return <></>;

    let representationText = representations[selectedIndex]?.value;

    let valueStyle: Partial<StandardProperties> = {
        flexGrow: 1,
        flexShrink: 1
    };
    if (showAll) {
        valueStyle.overflow = "auto";
        valueStyle.textOverflow = "clip";
        if (representationText?.trim().includes("\n")) {
            valueStyle.whiteSpace = "pre";
        } else {
            valueStyle.whiteSpace = "initial";
        }
        valueStyle.maxHeight = "80vh";
    } else {
        valueStyle.overflow = "hidden";
        valueStyle.textOverflow = "ellipsis";
        valueStyle.whiteSpace = "nowrap";
    }

    return <>
        <code
                ref={viewRef}
                tabIndex={0}
                style={valueStyle}
                onFocus={() => setShowAll(true)}
                onBlur={() => setShowAll(false)}>
            {representations[selectedIndex]?.value}
        </code>
        <select value={selectedIndex} onChange={e => {
            setSelectedIndex(parseInt(e.target.value));
            viewRef.current.focus();
        }}>
            {representations.map((repr, index) => <option value={index}>{repr.format}</option>)}
        </select>
    </>;
}

function generateUI(node: DecodeNode | KeyNode): {
    header: JSX.Element,
    initialChildren: (DecodeNode | KeyNode)[] | null,
    value: DecodeNode
} {
    let key = null;
    if (node instanceof KeyNode) {
        key = node.key;
        node = node.value;
    } else if (node instanceof FormatNode) {
        key = node.format;
        node = node.value;
    } else if (node instanceof KeyValueNode) {
        let data = generateUI(new KeyNode(node.key.representations[0]?.value ?? node.key.description, node.value));
        data.initialChildren = getInitialChildren(node);
        data.value = node;
        return data;
    }

    let type = node.description;
    while (node instanceof FormatNode) {
        node = node.value;
        type += " " + node.description;
    }

    return {
        header: <>
            <span style={{marginRight: "0.5em"}}>{key ? (key + ": ") : ""}{type}</span>
            <Representer representations={node.representations}/>
        </>,
        initialChildren: getInitialChildren(node),
        value: node
    };
}

function TreeNode({data}: {data: DecodeNode | KeyNode}) {
    let ui = generateUI(data);

    let [children, setChildren] = useState(ui.initialChildren);
    let [expanded, setExpanded] = useState(true);
    
    useEffect(() => {
        setChildren(ui.initialChildren || decode(ui.value));
    }, [data]);

    return <div style={{marginLeft: "1em"}} className={expanded ? "expanded" : ""}>
        <div style={{display: "flex", flexDirection: "row", whiteSpace: "nowrap", alignItems: "flex-start"}}>
            {children && children.length > 0 ? <button className="expand-button" onClick={e => {
                e.preventDefault();
                setExpanded(!expanded);
            }}>{expanded ? "-" : "+"}</button> : <div className="expand-button" />}
            {ui.header}
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
