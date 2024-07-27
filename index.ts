async function main() {
  const words = await getDictionaryWords();
  const matches = findMatches(words, [
    /* word fragments here */
  ]);

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

function findMatches(words: string[], fragments: string[]) {
  console.log(`\nFinding matches, given fragments ${fragments.join()}`);

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
