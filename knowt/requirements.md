# Requirements

## EBNF

```ebnf

space = " " | "\t"
nl = "\n"

Input = {Section}

Section = TitleLine BodyLines
BodyLines = {BodyLine}
BodyLine = text nl

TitleLine = (TitleLine1 | TitleLine2)
TitleLine1 = {space} ("==" | "=" ) {space} Title nl
TitleLine2 = {space} "**" {space} Title {space} "**" {space} nl

Output = {TitleDef}

TitleDef = Title "##" BodyLines "####"

```
