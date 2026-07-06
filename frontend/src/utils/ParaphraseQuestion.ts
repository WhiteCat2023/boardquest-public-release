import axios from "axios";

export interface ParaphraseQuestionProps {
  question: string[];
}

export const paraphraseQuestion = ({ question }: ParaphraseQuestionProps) => {

    const query = axios.post(
      "http://localhost:5678/webhook/926ceccf-e757-476f-9c04-1234e326cf88",
      {
        "prompt": question

      }
    );

    return query;
}
