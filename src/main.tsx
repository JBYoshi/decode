import { StrictMode, useEffect, useRef, useState } from "react";
import decode from "./decoders";
import { DecodeNode, Representation } from "./types";
import { StringNode } from "./nodes/string";
import { createRoot } from "react-dom/client";
import { StandardProperties } from "csstype";

function Representer({representations, link}: {representations: Representation[], link: {href: string, title: string} | null}) {
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
        {link && <a href={link.href} target="_blank" style={{marginRight: "0.5em"}}>{link.title}</a>}
        <select value={selectedIndex} onChange={e => {
            setSelectedIndex(parseInt(e.target.value));
            viewRef.current.focus();
        }}>
            {representations.map((repr, index) => <option value={index}>{repr.format}</option>)}
        </select>
    </>;
}

function TreeNode({data, hidden = false, onSignificantNodeDecoded = () => {}}: {data: DecodeNode, hidden?: boolean, onSignificantNodeDecoded?: () => void}) {
    let label = data.type;
    if (data.key) label = data.key + ": " + label;
    if (data.description) label += " (" + data.description + ")";

    let [children, setChildren] = useState(data.defaultChildren);
    let [expanded, setExpanded] = useState(false);
    let [expansionButtonClicked, setExpansionButtonClicked] = useState(false);
    
    useEffect(() => {
        if (data.significant || data.childrenSignificant) {
            onSignificantNodeDecoded();
            if (data.childrenSignificant) {
                if (!expansionButtonClicked && !expanded) {
                    setExpanded(true);
                }
                onSignificantNodeDecoded();
            }
        }
        let newChildren = [...data.defaultChildren, ...decode(data)];
        for (let child of newChildren) {
            if (child.significant) {
                if (!expansionButtonClicked && !expanded) {
                    setExpanded(true);
                }
                onSignificantNodeDecoded();
            }
        }
        setChildren(newChildren);
    }, [data]);

    return <div style={{marginLeft: "1em"}} className={expanded ? "expanded" : ""} hidden={hidden}>
        <div style={{display: "flex", flexDirection: "row", whiteSpace: "nowrap", alignItems: "flex-start"}}>
            {children && children.length > 0 ? <button className="expand-button" onClick={e => {
                e.preventDefault();
                setExpansionButtonClicked(true);
                setExpanded(!expanded);
            }}>{expanded ? "-" : "+"}</button> : <div className="expand-button" />}
            <span style={{marginRight: "0.5em"}}>{label}</span>
            <Representer representations={data.representations} link={data.link}/>
        </div>
        { (children || []).map(part => <TreeNode data={part} hidden={!expanded} onSignificantNodeDecoded={() => {
            if (!expansionButtonClicked && !expanded) {
                setExpanded(true);
                onSignificantNodeDecoded();
            }
        }}/>) }
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
