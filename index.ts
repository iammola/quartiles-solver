import readline from "node:readline/promises";

async function main() {
  const fragments = await getFragments();
  const words = await getDictionaryWords();
  const matches = findMatches(words, fragments);

  matches.forEach((match) => console.log(`- ${match}`));
}

async function getDictionaryWords() {
  console.log("\nLoading Dictionary words");

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/dwyl/english-words/master/words_dictionary.json"
    );
    const words = Object.keys(
      (await response.json()) as Record<string, 1>
    ).sort((a, b) => a.localeCompare(b));

    console.log(`${words.length} dictionary words loaded\n`);

    return words;
  } catch (error) {
    console.log("Error Loading words");
    return [];
  }
}

async function getFragments() {
  let fragments: string[] = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  do {
    fragments = await rl
      .question(
        `Enter at-least two word fragments. Split with a non-alphabetic character. `
      )
      .then((str) => str.split(/[^a-z]/i).filter(Boolean));

    if (fragments.length > 1)
      console.log(`\nGiven fragments ${fragments.join()}`);
  } while (
    fragments.length < 2 ||
    (
      (await rl.question("Do you want to continue? [y/n]? ")) || "y"
    ).toLowerCase() !== "y"
  );

  rl.close();
  return fragments;
}

function findMatches(words: string[], fragments: string[]) {
  console.log(`\nFinding matches`);

  const matches: string[] = [];

  fragments.forEach((mainFrag, mainFragIdx) => {
    if (words.includes(mainFrag)) matches.push(mainFrag);

    const startsWord = words.filter((word) => word.startsWith(mainFrag));
    if (startsWord.length < 1) return;

    startsWord.forEach((word) => {
      if (word === mainFrag) return;

      let remainingLetters = replaceFragment(word, mainFrag);
      for (
        let fragIdx = 0;
        remainingLetters !== "" && fragIdx < fragments.length;
        fragIdx++
      ) {
        if (fragIdx === mainFragIdx) continue;

        remainingLetters = replaceFragment(
          remainingLetters,
          fragments[fragIdx]
        );
      }

      if (remainingLetters === "-".repeat(word.length)) matches.push(word);
    });
  });

  console.log(`Found ${matches.length} words\n`);

  return matches.sort((a, b) =>
    a.length === b.length ? a.localeCompare(b) : a.length - b.length
  );
}

function replaceFragment(word: string, fragment: string) {
  return word.replace(fragment, "-".repeat(fragment.length));
}

main().finally(() => console.log("\nDone\n"));
