import decode from "./decoders.mjs";
import toString from "./to-string.mjs";

function makeTreeNode(data) {
    let node = document.createElement("div");

    let header = document.createElement("div");
    node.appendChild(header);

    let expandContractButton = document.createElement("button");
    expandContractButton.onclick = e => onExpandContractClicked(e);
    header.appendChild(expandContractButton);

    let label = document.createElement("span");
    header.appendChild(label);

    node.style.marginLeft = "1em";

    let expanded = false;

    function onExpandContractClicked(e) {
        e.preventDefault();

        setExpanded(!expanded);
    }

    let childTreeNodes = null;

    function setExpanded(newExpanded) {
        expanded = newExpanded;
        if (expanded) {
            expandContractButton.innerText = "-";
            node.classList.add("expanded");
            
            for (let child of childTreeNodes) {
                child.setHidden(false);
            }
            if (childTreeNodes.length == 1) {
                childTreeNodes[0].expanded = true;
            }
        } else {
            expandContractButton.innerText = "+";
            node.classList.remove("expanded");
            if (childTreeNodes) {
                for (let child of childTreeNodes) {
                    child.setHidden(true);
                }
            }
        }
    }

    label.innerText = [data.title, data.value].filter(x => !!x).map(toString).join(": ");
    let childData = data.children;

    function populateChildren() {
        if (childTreeNodes) return;

        if (!childData) childData = decode(data.value);
        childTreeNodes = childData.map(item => {
            let childNode = makeTreeNode(item);
            childNode.setHidden(true);
            return childNode;
        });

        for (let child of childTreeNodes) {
            node.appendChild(child.node);
        }

        expandContractButton.hidden = childTreeNodes.length == 0;
    }

    setExpanded(false);

    return {
        node,
        setHidden: function(value) {
            if (!value) {
                populateChildren();
            }
            node.hidden = value;
        },
        setExpanded
    };
}

addEventListener("load", function() {
    let input = document.getElementById("input");
    let output = document.getElementById("output");

    function onInputChanged() {
        output.innerText = null;
        let tree = makeTreeNode({value: input.value});
        tree.setHidden(false);
        tree.setExpanded(true);
        output.appendChild(tree.node);
    }
    input.onchange = input.onkeydown = input.onkeyup = input.onpaste = function() {
        onInputChanged();
    };
    onInputChanged();
});
