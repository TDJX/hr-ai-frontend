import React from "react";
import { FileText, Award, AlertTriangle, CheckCircle2 } from "lucide-react";

export interface InterviewReport {
  id: number;
  interview_session_id: number;
  technical_skills_score: number;
  experience_relevance_score: number;
  communication_score: number;
  problem_solving_score: number;
  cultural_fit_score: number;
  overall_score: number;
  recommendation: "strongly_recommend" | "recommend" | "consider" | "reject";
  strengths: Record<string, any>;
  weaknesses: Record<string, any>;
  red_flags: Record<string, any>;
  next_steps: string | null;
  interviewer_notes: string | null;
  pdf_report_url: string | null;
}

interface VacancyReportsProps {
  reports: InterviewReport[];
}

const recommendationLabels: Record<
  InterviewReport["recommendation"],
  string
> = {
  strongly_recommend: "сильно рекомендую",
  recommend: "рекомендую",
  consider: "рассмотреть",
  reject: "не рекомендую",
};

const recommendationColors: Record<
  InterviewReport["recommendation"],
  string
> = {
  strongly_recommend: "text-green-700 bg-green-100",
  recommend: "text-blue-700 bg-blue-100",
  consider: "text-yellow-700 bg-yellow-100",
  reject: "text-red-700 bg-red-100",
};

const scoringLabels: Record<string, string> = {
  technical_skills_score: "Технические навыки",
  experience_relevance_score: "Релевантность опыта",
  communication_score: "Коммуникация",
  problem_solving_score: "Решение задач",
  cultural_fit_score: "Культурная совместимость",
  overall_score: "Общая оценка",
};

const renderJsonAsList = (data: Record<string, any>) => {
  return (
    <ul className="list-disc list-inside text-xs bg-gray-50 p-2 rounded">
      {Object.entries(data).map(([key, value]) => (
        <li key={key}>
          <span className="font-medium">{key}:</span> {String(value)}
        </li>
      ))}
    </ul>
  );
};

export default function VacancyReports({ reports }: VacancyReportsProps) {

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        Отчёты по собеседованиям
      </h1>

      {reports.length === 0 ? (
        <p className="text-gray-600">Пока нет отчётов по этой вакансии.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-500" />
                  Отчёт #{report.id}
                </h2>

                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                    recommendationColors[report.recommendation]
                  }`}
                >
                  {recommendationLabels[report.recommendation]}
                </div>

                <div className="space-y-2 text-gray-700 text-sm">
                  {Object.entries(scoringLabels).map(([key, label]) => {
                    const score = report[key as keyof InterviewReport] as number;
                    return (
                      <p key={key}>
                        <span className="font-medium">{label}:</span> {score}/10
                      </p>
                    );
                  })}
                </div>

                {report.strengths &&
                  Object.keys(report.strengths).length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                        Сильные стороны
                      </h3>
                      {renderJsonAsList(report.strengths)}
                    </div>
                  )}

                {report.weaknesses &&
                  Object.keys(report.weaknesses).length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1 text-yellow-500" />
                        Слабые стороны
                      </h3>
                      {renderJsonAsList(report.weaknesses)}
                    </div>
                  )}

                {report.red_flags && Object.keys(report.red_flags).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-1 flex items-center text-red-600">
                      🚩 Red flags
                    </h3>
                    {renderJsonAsList(report.red_flags)}
                  </div>
                )}

                {report.interviewer_notes && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Заметки интервьюера
                    </h3>
                    <p className="text-sm text-gray-700">
                      {report.interviewer_notes}
                    </p>
                  </div>
                )}
              </div>

              {report.pdf_report_url && (
                <div className="mt-6">
                  <a
                    href={report.pdf_report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow hover:bg-indigo-700 transition"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Открыть PDF
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
