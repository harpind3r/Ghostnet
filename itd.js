const SYMBOLS = {

a:["𔑪","𛀔","𝌌","🁂","🪈"],
b:["𓀄","𓂏","𓃪","𓅛","𓇀"],
c:["𝈣","𝉂","𝈊","𝍖","𞓡"],
d:["𞤌","𞤚","𞤬","🀳","🙓"],
e:["🜔","🜩","🝄","🝝","🝯"],

f:["🞉","🞣","🞻","🡂","𖽏"],
g:["𐫄","𐫎","𐬝","𐬼","𐬴"],
h:["ਿ","ਔ","ઊ","𐎣","𐏔"],
i:["𐠌","𐠱","𐠼","𐣵","𐫓"],
j:["𐌾","𐪗","𐪚","𐪑","𐪂"],

k:["𐬄","𐬫","𐴴","𑂐","𑂳"],
l:["𝼅","𝼒","𝼞","𞋀","𞋡"],
m:["𰀈","𰁦","+","ᎀ","᎙"],
n:["ᐙ","ᑒ","ឱ","ᴻ","ꤎ"],
o:["ᐵ","ធ","ោ","ᴤ","ꤥ"],

p:["ᚍ","ᚠ","Ἆ","⠅","Ⲷ"],
q:["ᚁ","ᚸ","▰","ⲋ","ꠟ"],
r:["＊","﹏","串","ퟗ","ɍ"],
s:["︽","ꮡ","︧","ퟻ","ꥩ"],
t:["𐍄","ㄒ","꓄","꠫","𓀣"],

u:["𓀸","ଆ","ഩ","ໆ","༬"],
v:["𖬒","ଟ","ູ","༊","ဠ"],
w:["Ⴔ","ᅃ","ᅽ","᎘","ᑀ"],
x:["ლ","᧪","ቒ","Ꮂ","ᑞ"],
y:["ᚏ","ᜀ","ᜲ","ᝁ","ល"],
z:["᚜","ᜒ","ᝍ","ᝓ","᧭"],
" ":["𞟲","𑈡","𑿥"],

// NUMBERS

"0":["ᰫ","᳄","Ⲽ"],
"1":["ᰲ","᳁","ⷢ"],
"2":["᰿","᳂","ⷵ"],
"3":["᱉","᳃","ⷿ"],
"4":["ᱏ","᳇","⸎"],
"5":["ᱰ","ᳳ","⺽"],
"6":["ᱽ","ᶺ","⿵"],
"7":["ᱲ","ᶦ","⿸"],
"8":["ᲈ","⬗","ヾ"],
"9":["Ჿ","⬙","㈍"],
"!":["𞟫","𞟳","𞟼"],
"@":["𞴍","𞴓","𞴣"],
"#":["🜀","🙭","🜒"],
"$":["🝒","🝜","🝱"],
"%":["🙿","🙷","🙬"],
"^":["🀗","🀈","🀁"],
"&":["🂳","🂼","🃆"],
"*":["🈞","🉂","🉥"],
"(":["🙛","Ċ","ĸ"],
")":["Ϫ","Ͼ","Ϻ"],
"-":["Ϸ","ϴ","Ϭ"],
"_":["ξ","Ϡ","Ϣ"],
"+":["𐺎","𐬏","Ϊ"],
"=":["𐺬","𐺈","𐺖"],
",":["𐺜","𐊜","𐊖"],
"<":["𐊚","𐊑","𐊉"],
".":["𐊃","𐊷","𐊯"],
">":["𐊩","𐊧","𐊣"],
"?":["𐊳","𐋁","𐋐"],
"/":["𐌺","𐍅","𐍆"],
":":["𐌴","𐌳","𐌰"],
";":["𐎩","𐎱","𐎿"],
":":["𐏈","𐏉","𐏊"],
"'":["𐏏","𐎽","𐎨"],
"[":["𐔞","𐔢","𐔔"],
"{":["𐔀","𐔁","𐔆"],
"]":["𐡧","𐡯","𐡷"],
"}":["𐡼","𐡺","𐡾"],
"|":["𐡳","𐡠","𐡪"],
"~":["𑀒","𑀣","𑀰"],
"`":["𑀼","𑁅","𑁍"],
'"':["𑁈","𑁌","𑀺"],
"\\" : ["𑖌","𑖖","𑖤"]

}

const NOISE = [
"☠",
"€",
"☣",
"𐋰",
"𐋺",
"𐌌",
"𐐁",
"☬",
"𐘅",
"𐤇",
"𐤛",
"𐤧",
"𐫤",
"𐴛",
"𐺇",
"𐼡",
"𐽔",
"𐽙",
"𐿱",
"𑃧"

]
// REVERSE MAP EXACTLY AS YOUR LOGIC
const reverseMap = {};
for (let key in SYMBOLS) {
    SYMBOLS[key].forEach(symbol => {
        if (symbol && symbol !== "") {
            reverseMap[symbol] = key;
        }
    });
}

const ITD = {
    encode: function(text) {
        let input = text.toLowerCase();
        let result = "";

        for (let char of input) {
            if (SYMBOLS[char] && SYMBOLS[char].length > 0 && SYMBOLS[char][0] !== "") {
                let arr = SYMBOLS[char];
                let randomSymbol = arr[Math.floor(Math.random() * arr.length)];
                result += randomSymbol;

                // RANDOM NOISE (Your 0.5 probability logic)
                if (Math.random() > 0.5) {
                    let noise = NOISE[Math.floor(Math.random() * NOISE.length)];
                    result += noise;
                }
            } else {
                // Keep original character if not found in symbols mapping
                result += char;
            }
        }
        return result;
    },
    
    decode: function(mutatedText) {
        let result = "";
        let chars = [...mutatedText]; // Your exact spread syntax for handling complex symbols

        chars.forEach(char => {
            // IGNORE NOISE
            if (NOISE.includes(char)) {
                return;
            }

            // REAL SYMBOL
            if (reverseMap[char]) {
                result += reverseMap[char];
            } else {
                // If it's a regular unmapped character (like a normal space or unmapped punctuation)
                result += char;
            }
        });
        return result;
    }
};