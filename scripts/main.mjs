import decode from "./decoders.mjs";
import toString from "./to-string.mjs";

class DecoderTreeElement extends HTMLDivElement {
    constructor() {
        super();

        this.attachShadow({mode: "open"});

        this.header = document.createElement("div");
        this.header.style.display = "flex";
        this.header.style.height = "1.3em";
        this.shadowRoot.appendChild(this.header);

        this.expandContractButtonSlot = document.createElement("div");
        this.expandContractButtonSlot.style.width = "1.5em";
        this.expandContractButtonSlot.style.flexShrink = "0";
        this.header.appendChild(this.expandContractButtonSlot);

        this.expandContractButton = document.createElement("button");
        this.expandContractButton.onclick = e => this.onExpandContractClicked(e);
        this.expandContractButtonSlot.appendChild(this.expandContractButton);

        this.label = document.createElement("div");
        this.label.style.overflow = "hidden";
        this.label.style.whiteSpace = "nowrap";
        this.label.style.textOverflow = "ellipsis";
        this.label.style.flexGrow = "1";
        this.label.style.flexShrink = "1";
        this.header.appendChild(this.label);

        this.toolbar = document.createElement("div");
        this.header.appendChild(this.toolbar);
        this.viewButton = document.createElement("button");
        this.viewButton.innerText = "View";
        this.viewButton.onclick = e => this.valueExpanded = !this.valueExpanded;
        this.toolbar.appendChild(this.viewButton);

        this.style.marginLeft = "1.5em";

        this._childrenExpanded = false;
        this.childrenExpanded = false;

        this.valueExpanded = false;
    }

    onExpandContractClicked(e) {
        e.preventDefault();

        this.childrenExpanded = !this.childrenExpanded;
    }

    get valueExpanded() {
        return this.label.style.whiteSpace == "normal";
    }

    set valueExpanded(expanded) {
        if (expanded) {
            this.header.style.height = "auto";
            this.label.style.whiteSpace = "normal";
        } else {
            this.header.style.height = "1.3em";
            this.label.style.whiteSpace = "nowrap";
        }
    }

    get childrenExpanded() {
        return this._childrenExpanded;
    }

    set childrenExpanded(expanded) {
        this._childrenExpanded = expanded;
        if (expanded) {
            this.expandContractButton.innerText = "-";
            this.classList.add("expanded");
            
            for (let child of this.childTreeNodes) {
                child.hidden = false;
                child.populateChildren();
            }
            if (this.childTreeNodes.length == 1) {
                this.childTreeNodes[0].childrenExpanded = true;
            }
        } else {
            this.expandContractButton.innerText = "+";
            this.classList.remove("expanded");
            if (this.childTreeNodes) {
                for (let child of this.childTreeNodes) {
                    child.hidden = true;
                }
            }
        }
    }

    set data(data) {
        this.label.innerText = [data.title, data.value].filter(x => !!x).map(toString).join(": ");
        this.value = data.value;
        this.childData = data.children;
    }

    populateChildren() {
        if (this.childTreeNodes) return;

        if (!this.childData) this.childData = decode(this.value);
        this.childTreeNodes = this.childData.map(item => {
            let node = new DecoderTreeElement();
            node.data = item;
            node.hidden = true;
            return node;
        });

        for (let child of this.childTreeNodes) {
            this.shadowRoot.appendChild(child);
        }

        this.expandContractButton.hidden = this.childTreeNodes.length == 0;
    }
}

customElements.define("decoder-tree-element", DecoderTreeElement, {extends: "div"});

addEventListener("load", function() {
    let input = document.getElementById("input");
    let output = document.getElementById("output");

    function onInputChanged() {
        output.innerText = null;
        let tree = new DecoderTreeElement();
        tree.data = {value: input.value};
        tree.populateChildren();
        tree.childrenExpanded = true;
        output.appendChild(tree);
    }
    input.onchange = input.onkeydown = input.onkeyup = input.onpaste = function() {
        onInputChanged();
    };
    onInputChanged();
});
