import {marked, setOptions} from "marked"
import hljs from "highlight.js/lib/core"

import bash from "highlight.js/lib/languages/bash"
import c from "highlight.js/lib/languages/c"
import cpp from "highlight.js/lib/languages/cpp"
import csharp from "highlight.js/lib/languages/csharp"
import css from "highlight.js/lib/languages/css"
import go from "highlight.js/lib/languages/go"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import kotlin from "highlight.js/lib/languages/kotlin"
import markdown from "highlight.js/lib/languages/markdown"
import php from "highlight.js/lib/languages/php"
import python from "highlight.js/lib/languages/python"
import rust from "highlight.js/lib/languages/rust"
import sql from "highlight.js/lib/languages/sql"
import swift from "highlight.js/lib/languages/swift"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"

hljs.registerLanguage("bash", bash)
hljs.registerLanguage("c", c)
hljs.registerLanguage("cpp", cpp)
hljs.registerLanguage("csharp", csharp)
hljs.registerLanguage("css", css)
hljs.registerLanguage("go", go)
hljs.registerLanguage("html", xml)
hljs.registerLanguage("java", java)
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("json", json)
hljs.registerLanguage("kotlin", kotlin)
hljs.registerLanguage("markdown", markdown)
hljs.registerLanguage("php", php)
hljs.registerLanguage("python", python)
hljs.registerLanguage("rust", rust)
hljs.registerLanguage("sql", sql)
hljs.registerLanguage("swift", swift)
hljs.registerLanguage("typescript", typescript)
hljs.registerLanguage("xml", xml)
hljs.registerLanguage("yaml", yaml)

function highlightCode(code: string, lang: string): string {
    const language = lang?.trim()
    if (language && hljs.getLanguage(language)) {
        try {
            return hljs.highlight(code, {language}).value
        } catch {
            // fall through to auto-detect
        }
    }
    return hljs.highlightAuto(code).value
}

export function buildDiaryListContentHtml(content: string, category: string, title = ""): string {
    return content.replace(/\n/g, "<br/>")
}

export function buildDiaryContentHtml(content: string, category: string, hideContent = false, title = ""): string {
    const isInCodeMode = /\[ ?code ?]/i.test(content)
    if (isInCodeMode) {
        return `<pre class="code">${hideContent ? content.replace(/[^，。 \n]/g, "*") : content}</pre>`
    }
    return content
        .split("\n")
        .map(item => (item === "" ? "<br/>" : `${hideContent ? item.replace(/[^，。 \n]/g, "*") : item}<br/>`))
        .join("")
}

setOptions({
    highlight: highlightCode,
    langPrefix: "hljs language-",
})

export function parseMarkdown(content: string | undefined | null): string {
    if (!content) {
        return ""
    }
    return marked.parse(content)
}
