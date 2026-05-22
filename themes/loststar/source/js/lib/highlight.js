mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        hljs.configure({ ignoreUnescapedHTML: true });
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        getLanguage(pre) {
            const code = pre.querySelector("code");
            const classes = [...pre.classList, ...(code ? code.classList : [])];
            const languageClass = classes.find((name) => {
                return name && name !== "hljs" && !name.startsWith("hljs-");
            });
            if (!languageClass) return "plaintext";
            return languageClass.replace(/^language-/, "").replace(/^lang-/, "");
        },
        renderPrompt(html) {
            return html.replace(/^(\s*)(\$)(?=\s)/gm, '$1<span class="shell-prompt">$2</span>');
        },
        highlight() {
            let codes = document.querySelectorAll("pre");
            for (let i of codes) {
                let code = i.textContent;
                let language = this.getLanguage(i);
                let highlighted;
                try {
                    highlighted = hljs.highlight(code, { language }).value;
                } catch {
                    highlighted = code;
                }
                highlighted = this.renderPrompt(highlighted);
                i.innerHTML = `
                <div class="code-content hljs">${highlighted}</div>
                <div class="language">${language}</div>
                <div class="copycode">
                    <i class="fa-solid fa-copy fa-fw"></i>
                    <i class="fa-solid fa-check fa-fw"></i>
                </div>
                `;
                let content = i.querySelector(".code-content");
                hljs.lineNumbersBlock(content, { singleLine: true });
                let copycode = i.querySelector(".copycode");
                copycode.addEventListener("click", async () => {
                    if (this.copying) return;
                    this.copying = true;
                    copycode.classList.add("copied");
                    await navigator.clipboard.writeText(code);
                    await this.sleep(1000);
                    copycode.classList.remove("copied");
                    this.copying = false;
                });
            }
        },
    },
};
