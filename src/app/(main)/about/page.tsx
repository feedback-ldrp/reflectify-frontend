// src/app/(main)/about/page.tsx
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { UploadHeader } from "@/components/upload/UploadHeader";
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  const features = [
    {
      icon: AcademicCapIcon,
      title: "Academic Excellence",
      description:
        "Streamlining feedback collection to enhance teaching quality and student learning outcomes.",
    },
    {
      icon: ChartBarIcon,
      title: "Data-Driven Insights",
      description:
        "Advanced analytics and reporting to help institutions make informed decisions.",
    },
    {
      icon: UserGroupIcon,
      title: "Community Focused",
      description:
        "Connecting students, faculty, and administrators in a unified feedback ecosystem.",
    },
    {
      icon: StarIcon,
      title: "Quality Assurance",
      description:
        "Ensuring consistent and reliable feedback mechanisms across all departments.",
    },
  ];

  const teamMembers = [
    {
      name: "Harsh Patel",
      role: "Full Stack Developer",
      image: "/harsh.jpg",
      description: "Backend architecture and API development specialist",
    },
    {
      name: "Kandarp Joshi",
      role: "Frontend Developer",
      image: "/kandarp.jpg",
      description: "UI/UX design and React development expert",
    },
    {
      name: "Parin Naik",
      role: "Full Stack Developer",
      image: "/parin.jpg",
      description: "Database design and system integration specialist",
    },
  ];

  return (
    <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="space-y-12">
          {/* Header Section */}
          <UploadHeader title="About Reflectify" />

          {/* Mission Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <HeartIcon className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                  Our Mission
                </h2>
                <p className="text-lg text-blue-800 dark:text-blue-200 max-w-4xl mx-auto leading-relaxed">
                  Reflectify is dedicated to revolutionizing the educational
                  feedback ecosystem by providing a comprehensive, user-friendly
                  platform that bridges the gap between students, faculty, and
                  administrators. We believe that effective feedback is the
                  cornerstone of academic excellence and continuous improvement.
                </p>
              </div>
            </div>
          </Card>

          {/* Features Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Comprehensive tools and features designed to enhance the
                educational experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-lighter rounded-xl">
                      <feature.icon className="h-6 w-6 text-primary-dark" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Team Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                The talented individuals behind Reflectify&apos;s development
                and success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamMembers.map((member, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary-lighter"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            member.name,
                          )}&background=e5f3ff&color=1e40af&size=96`;
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-primary-dark font-medium mb-2">
                        {member.role}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {member.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Vision Section */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-2xl border border-green-200 dark:border-green-800">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <LightBulbIcon className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-4">
                  Our Vision
                </h2>
                <p className="text-lg text-green-800 dark:text-green-200 max-w-4xl mx-auto leading-relaxed">
                  We envision a future where educational institutions worldwide
                  utilize data-driven feedback systems to continuously evolve
                  and improve. Through Reflectify, we aim to create a
                  transparent, efficient, and meaningful dialogue between all
                  stakeholders in the educational process.
                </p>
              </div>
            </div>
          </Card>

          {/* Technology Stack */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Built with Modern Technology
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Powered by cutting-edge technologies for optimal performance and
                user experience
              </p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">React</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Frontend Framework
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    Node.js
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Backend Runtime
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    Prisma
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Database ORM
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-indigo-600">
                    TypeScript
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Type Safety
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
