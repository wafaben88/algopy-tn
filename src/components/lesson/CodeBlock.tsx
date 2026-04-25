"use client";

interface CodeBlockProps {
  code: string;
  language?: "python" | "pseudo" | "text";
  title?: string;
}

const PY_KW = [
  "if",
  "elif",
  "else",
  "for",
  "while",
  "def",
  "return",
  "in",
  "and",
  "or",
  "not",
  "True",
  "False",
  "None",
  "import",
  "from",
  "as",
  "pass",
  "break",
  "continue",
  "class",
  "with",
  "try",
  "except",
  "finally",
  "raise",
  "lambda",
];

const PS_KW = [
  "Algorithme",
  "Début",
  "Fin",
  "Si",
  "Alors",
  "Sinon",
  "FinSi",
  "Pour",
  "de",
  "à",
  "Faire",
  "Fin Pour",
  "Tant que",
  "Fin TantQue",
  "Écrire",
  "Lire",
  "DIV",
  "MOD",
  "Vrai",
  "Faux",
  "Fonction",
  "Procédure",
  "retourner",
  "TDO",
  "entier",
  "réel",
  "chaîne",
  "booléen",
  "tableau",
];

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function highlight(code: string, language: "python" | "pseudo" | "text") {
  if (language === "text") return escape(code);
  const kw = language === "python" ? PY_KW : PS_KW;
  // Process line by line so we can do comments & strings per line.
  return code
    .split("\n")
    .map((line) => {
      // Strings
      let s = escape(line).replace(
        /("[^"]*"|'[^']*')/g,
        '<span class="str">$1</span>',
      );
      // Comments
      if (language === "python") {
        s = s.replace(/(#.*)$/, '<span class="com">$1</span>');
      } else {
        s = s.replace(/(\{[^}]*\})/g, '<span class="com">$1</span>');
      }
      // Numbers
      s = s.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="num">$1</span>');
      // Keywords (whole word, but allow multi-word keywords like "Fin Pour" / "Tant que")
      const sorted = [...kw].sort((a, b) => b.length - a.length);
      for (const k of sorted) {
        const escapedKw = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const re = new RegExp(`(?<![\\wÀ-ÿ])(${escapedKw})(?![\\wÀ-ÿ])`, "g");
        s = s.replace(re, '<span class="kw">$1</span>');
      }
      // Function names
      if (language === "python") {
        s = s.replace(
          /\b([a-zA-Z_][\w]*)\s*\(/g,
          '<span class="fn">$1</span>(',
        );
      }
      return s;
    })
    .join("\n");
}

export function CodeBlock({ code, language = "python", title }: CodeBlockProps) {
  const html = highlight(code, language);
  return (
    <div>
      {title && (
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary-glow)]" />
          {title}
        </div>
      )}
      <pre
        className="code-block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function DualCode({
  pseudo,
  python,
  explanation,
}: {
  pseudo: string;
  python: string;
  explanation?: string;
}) {
  return (
    <div className="my-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <CodeBlock code={pseudo} language="pseudo" title="Pseudo-code tunisien" />
        <CodeBlock code={python} language="python" title="Python" />
      </div>
      {explanation && (
        <p className="text-sm text-[var(--muted)] italic">💡 {explanation}</p>
      )}
    </div>
  );
}
