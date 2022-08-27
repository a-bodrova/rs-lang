/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useEffect, useState } from 'react';
import { WordInterface } from '../../types/common';
import getWords, { getGroupWords } from './api';
import { getRandomPage, getRandomTranslate, shuffle } from './utils';
import Loading from './Loading';
import { baseURL } from './axiosInstance';
import './audio.svg';
import './style.scss';
// import RenderAnswerBtns from './RenderAnswerBtns';
import RenderAnswerCard from './RenderAnswerCard';
import RenderResults from './RenderResults';
import CreateAudioButton from './CreateAudioButton';
import { Button } from '@mui/material';

const RenderQuestion = (props: { groupWords: number }) => {
  const [words, setWords] = useState<WordInterface[]>([]);
  const [allWords, setAllWords] = useState<string[]>([]);
  const [answerArray, setAnswerArray] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  // const [isWordLoading, setIsWordLoading] = useState(false);

  const [wordsCount, setWordsCount] = useState<number | null>(null);
  const [word, setWord] = useState<WordInterface | null>(null);

  const [answer, setAnswer] = useState('');
  const [isClicked, setIsClicked] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [countWin, setCountWin] = useState<WordInterface[]>([]);
  const [countLose, setCountLose] = useState<WordInterface[]>([]);
  const [nameBtnNext, setNameBtnNext] = useState('Не знаю');
  const [audioSrs, setAudioSrc] = useState('');

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);

      const uploadedWords = await getWords(props.groupWords, getRandomPage());
      setWords(uploadedWords);
      const uploadedGroup = await getGroupWords(props.groupWords);
      setAllWords(uploadedGroup);

      setIsLoading(false);
      setWordsCount(0);
    };
    getData();
  }, []);

  useEffect(() => {
    if (wordsCount !== null && wordsCount < 20) {
      setWord(words[wordsCount]);
      setAnswer(words[wordsCount].wordTranslate);
      const newSet: Set<string> = new Set();
      newSet.add(words[wordsCount].wordTranslate);
      while (newSet.size !== 5) {
        newSet.add(getRandomTranslate(allWords));
      }
      setAnswerArray([...shuffle(Array.from(newSet))]);
      setAudioSrc(`${baseURL}/${words[wordsCount].audio}`);
      setIsClicked(false);
      setIsCorrectAnswer(false);
      setNameBtnNext('Не знаю');
    }
  }, [wordsCount]);

  const handleAnswerClick = (item: string) => {
    if (!word) return;
    if (!isClicked) {
      if (answer === item) {
        setCountWin([...countWin, word]);
        setIsCorrectAnswer(true);
        setNameBtnNext('➙');
      } else {
        setCountLose([...countLose, word]);
        setIsCorrectAnswer(false);
        setNameBtnNext('➙');
      }
      setIsClicked(true);
    }
  };

  const handleMainBtnClick = () => {
    if (!word || wordsCount === null) {
      return;
    }
    if (nameBtnNext === 'Не знаю') {
      setCountLose([...countLose, word]);
      setIsCorrectAnswer(false);
      setNameBtnNext('➙');
      setIsClicked(true);
    }
    if (nameBtnNext === '➙' && wordsCount !== null) {
      setWordsCount(wordsCount + 1);
    }
  };
  return (
    <>
      {/* {isLoading && <Loading />} */}
      {!isLoading && wordsCount !== null && word ? (
        <div className="word-box">
          {countLose.length !== 5 && wordsCount < 20 ? (
            <div className="question-wrapper">
              <div className="audio-btn-wrapper">
                {!isClicked ? (
                  <CreateAudioButton audioSrs={audioSrs} autoPlay btnClass="audio-button" />
                ) : (
                  <RenderAnswerCard isCorrectAnswer={isCorrectAnswer} word={word} />
                )}
              </div>
              <ul className="answer-buttons__list">
                {answerArray.map((item, index) => (
                  <li className="answer-button__item" key={item} data-translate={item}>
                    <Button
                      variant="outlined"
                      onClick={() => handleAnswerClick(item)}
                      className="answer-button"
                      type="button"
                      data-translate={item}
                    >
                      {`${index + 1}. ${item}`}
                    </Button>
                  </li>
                ))}
              </ul>
              {/* <RenderAnswerBtns answerArray={answerArray} word={word} /> */}
              <Button
                variant="contained"
                onClick={() => handleMainBtnClick()}
                className="main-button"
                type="button"
              >
                {nameBtnNext}
              </Button>
            </div>
          ) : (
            <RenderResults countLose={countLose} countWin={countWin} />
          )}
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default RenderQuestion;
