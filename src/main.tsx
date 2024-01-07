import { useEffect, useState } from "react";
import { render } from "react-dom";
import decode from "./decoders.js";
import toString from "./to-string.js";
import { DecodeNode } from "./types.js";

function TreeNode({data}: {data: DecodeNode}) {
    let [children, setChildren] = useState(data.children || null);
    let [expanded, setExpanded] = useState(false);
    
    useEffect(() => {
        setChildren(data.children || decode(data.value));
    }, [data]);

    let title: string;
    if (data.key) {
        title = data.key + ": ";
    } else {
        title = "";
    }
    if (data.description) {
        title += data.description;
        if (data.value !== undefined) {
            title += " - ";
        }
    }
    if (data.value) {
        title += toString(data.value);
    }

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

    function onInputChanged() {
        let decoded = decode(input.value).map(part => <TreeNode data={part} />);
        if (decoded.length == 0) decoded.push(<>Couldn't decode anything</>);
        render(decoded, output);
    }
    input.onchange = input.onkeydown = input.onkeyup = input.onpaste = function() {
        onInputChanged();
    };
    onInputChanged();
});
