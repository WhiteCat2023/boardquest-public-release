import axios from "axios";

export interface ParaphraseQuestionProps {
  question: string[];
}

export const paraphraseQuestion = ({ question }: ParaphraseQuestionProps) => {

    const webhookUrl =
      import.meta.env.VITE_N8N_PARAPHRASE_WEBHOOK_URL ||
      "http://localhost:5678/webhook/926ceccf-e757-476f-9c04-1234e326cf88";

    const query = axios.post(
      webhookUrl,
      {
        "prompt": question

      }
    );

    return query;
}
