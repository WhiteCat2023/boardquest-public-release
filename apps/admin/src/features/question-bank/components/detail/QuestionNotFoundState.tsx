import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuestionNotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center font-sans">
      <AlertCircle size={40} className="text-primary" />
      <div>
        <h3 className="text-lg font-bold text-foreground">
          Question Not Found
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          This question could not be retrieved from the database.
        </p>
      </div>
      <Link to="/question-bank">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5">
          Back to Question Bank
        </Button>
      </Link>
    </div>
  );
}

export default QuestionNotFoundState;
