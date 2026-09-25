import { useState } from 'react'
import './App.css'

interface WordDefinition {
  definition: string;
  examples?: string[];
}
interface WordMeaning {
  partOfSpeech: string;
  definitions: WordDefinition[];
}
interface DictionaryWordData {
  wordName: string;
  en: WordMeaning[];
}

function cleanHtmlText(rawString: string): string {
  const htmlRegex = /<[^>]*>/g;
  return rawString.replace(htmlRegex, '').trim();
}

export default function App() {
  const [query, setQuery] = useState<string>('');
  const [wordData, setWordData] = useState<DictionaryWordData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');


  async function findWord() {
    if (query.trim() === '') {
      setErrorMessage('Please enter a word');
      setWordData(null);
      return;
    }
    setLoading(true);
    setErrorMessage('');
    setWordData(null);
    try {
      const response = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Word not found!');
      }
      const data: DictionaryWordData = await response.json();
      const customWordObject = {
        ...data,
        wordName: query 
      };
      setWordData(customWordObject);
      console.log(data);
    } 
    catch (error: any) {
        console.error('Error fetching data:', error);
        setErrorMessage(error.message);
    }
    finally {
      setLoading(false); 
    }
  }
  return (
    <div id='app-container'>
      <div id='searchArea'>
        <input type='text' placeholder='Search a word' value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key ==='Enter'  && findWord()}/>
        <button onClick={findWord}>Search</button>
      </div>

      {errorMessage && <p className='error-text'>{errorMessage}</p>}
      {loading && <p className='loading-text'>Loading Word Details...</p>}

      {wordData && (
        <div className='result-card'>
          <h2>Word: {wordData.wordName}</h2>
          <p>Part of Speech: {cleanHtmlText(wordData.en[0].partOfSpeech)}</p>
          <p>Definition: {cleanHtmlText(wordData.en[0].definitions[0].definition)}</p>

          {wordData.en[0].definitions[0].examples && wordData.en[0].definitions[0].examples.length > 0 && (
            <div className='examples-container'>
              <h3>Usage Examples: </h3>
              <ul>
                {wordData.en[0].definitions[0].examples
                .slice(0, 3)
                .map((ex, index) => (
                  <li key={index}>"{cleanHtmlText(ex)}"</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}