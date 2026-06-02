"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Button, Row, Col } from "react-bootstrap";
import { logoBlue } from "@/components/assets/Images";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="mb-10 flex justify-center">
              <Image
                src={logoBlue}
                alt="CabKn Logo"
                width={120}
                height={120}
                className="object-contain animate-fade-in"
              />
            </div>

            <div className="space-y-6">
              <h1 className="text-8xl font-black text-[#004a70] mb-2 scale-in opacity-20 select-none absolute left-1/2 -translate-x-1/2 -z-10 blur-[1px]">
                404
              </h1>

              <div className="relative z-10 pt-10">
                <h2 className="text-3xl font-bold text-[#333] mb-4 loginsbHead">
                  Oops! Page Not Found
                </h2>
                <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
                  The page you are looking for might have been removed, had its
                  name changed, or is temporarily unavailable.
                </p>

                <div className="flex justify-center pt-4">
                  <Link href="/" passHref>
                    <Button className="loginBtn !bg-[#004a70] !border-0 !px-10 !h-[55px] !rounded-xl font-bold flex items-center justify-center transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-[#004a70]/20">
                      Return Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-20 text-gray-400 text-sm">
              © {new Date().getFullYear()} CabKn Technologies. All rights
              reserved.
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .scale-in {
          animation: scaleIn 1s ease-out forwards;
        }
        @keyframes scaleIn {
          from {
            transform: translateX(-50%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) scale(1);
            opacity: 0.15;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
