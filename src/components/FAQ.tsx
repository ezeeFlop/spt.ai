import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'What types of AI applications are available?',
    answer: 'We offer a wide range of AI applications including text analysis, image processing, and more. Each application is designed to solve specific business problems and can be integrated into your existing workflow.',
  },
  {
    question: 'How does the pricing work?',
    answer: 'We offer three tiers of pricing: Starter, Professional, and Enterprise. Each tier includes different features and usage limits. You can choose the plan that best fits your needs and upgrade or downgrade at any time.',
  },
  {
    question: 'Can I integrate these AI applications with my existing tools?',
    answer: 'Yes! All our AI applications come with API access (Professional and Enterprise plans) that allows for seamless integration with your existing tools and workflows.',
  },
  // Add more FAQs as needed
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Frequently Asked Questions</h2>
      <dl className="space-y-6 divide-y divide-gray-900/10">
        {faqs.map((faq, index) => (
          <div key={index} className="pt-6">
            <dt>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between text-left text-gray-900"
              >
                <span className="text-base font-semibold leading-7">{faq.question}</span>
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
                <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
              </dd>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
};

export default FAQ;