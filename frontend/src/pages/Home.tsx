import { useEffect, useState } from 'react';
import { ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { contentApi } from '../services/api';
import type { HomeContent } from '../types/content';

const IconMap = {
  Brain,
  Sparkles,
  Zap
};

const DEFAULT_CONTENT: HomeContent = {
  content: {
    hero: {
      title: '',
    subtitle: '',
    ctaPrimary: '',
    ctaSecondary: ''
    },
    features: {
      title: '',
      subtitle: '',
      items: []
    }
  }
};

const Home = () => {
  const intl = useIntl();
  const [content, setContent] = useState<HomeContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await contentApi.getHomeContent(intl.locale);
        console.log('Home Content response', response);
        // Ensure we have a valid content structure
        if (response && response.content.hero && response.content.features) {
          setContent(response);
        } else {
          console.error('Invalid content structure:', response);
          setContent(DEFAULT_CONTENT);
        }
      } catch (error) {
        console.error('Error fetching home content:', error);
        setContent(DEFAULT_CONTENT);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [intl.locale]);

  if (loading || !content) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="relative isolate">
        {/* Hero section */}
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-radial from-primary-100 to-transparent opacity-40" />
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center relative">
              <div className="flex justify-center mb-8">
                <Brain className="h-16 w-16 text-primary-600" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                {content.content.hero.title}
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {content.content.hero.subtitle}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 relative z-20">
                <Link
                  to="/pricing"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {content.content.hero.ctaPrimary}
                </Link>
                <Link
                  to="/features"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  {content.content.hero.ctaSecondary} <ArrowRight className="inline-block ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              {content.content.features.title}
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {content.content.features.subtitle}
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {content.content.features.items.map((feature, index) => {
                const Icon = IconMap[feature.icon];
                return (
                  <div key={index} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <Icon className="h-5 w-5 flex-none text-primary-600" />
                      {feature.title}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;