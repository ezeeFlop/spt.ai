import React from 'react';
import { useIntl } from 'react-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    questionId: 'faq.question.applications',
    answerId: 'faq.answer.applications',
  },
  {
    questionId: 'faq.question.pricing',
    answerId: 'faq.answer.pricing',
  },
  {
    questionId: 'faq.question.integration',
    answerId: 'faq.answer.integration',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const intl = useIntl();

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
        {intl.formatMessage({ id: 'faq.title' })}
      </h2>
      <dl className="space-y-6 divide-y divide-gray-900/10">
        {faqs.map((faq, index) => (
          <div key={index} className="pt-6">
            <dt>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-gray-900"
              >
                <span className="text-base font-semibold leading-7">
                  {intl.formatMessage({ id: faq.questionId })}
                </span>
                <span className="ml-6 flex h-7 items-center">
                  {openIndex === index ? (
                    <ChevronUp className="h-6 w-6" />
                  ) : (
                    <ChevronDown className="h-6 w-6" />
                  )}
                </span>
              </button>
            </dt>
            {openIndex === index && (
              <dd className="mt-2 pr-12">
                <p className="text-base leading-7 text-gray-600">
                  {intl.formatMessage({ id: faq.answerId })}
                </p>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
};

export default FAQ;