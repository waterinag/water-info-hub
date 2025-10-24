"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Box, Flex, Separator, TextField } from "@radix-ui/themes";
import { useSession } from "next-auth/react"; // ✅ get user info from NextAuth
import LeftNav from "@/components/common/LeftNav";
import AppHeader from "@/components/common/AppHeader";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircle, X, Eye, SquarePen, SquareArrowOutUpRight, Search } from "lucide-react";
import { useToast } from "@/provider/ToastContext";
import { useAlert } from "@/provider/AlertContext";
import { useRouter } from "next/navigation";


function ProjectCard({ project, onView }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Header (actions) */}


      {/* Body */}
      <div className="relative w-full h-40 bg-gray-100">
        <a
          href={project.project_url}
          target="_blank"
          rel="noopener noreferrer"

        >
          {project.project_thumbnail && (

            <img
              src={project.project_thumbnail}
              alt={project.project_name}
              className="object-cover w-full h-40 rounded-lg"
            />

            // <Image
            //   src={project.project_thumbnail}
            //   alt={project.project_name}
            //   fill
            //   className="object-cover"
            // />
          )}

        </a>

      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">
          {project.project_name}
        </h3>

        {project.project_desc && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {project.project_desc}
          </p>
        )}


        <p className="text-xs text-gray-400 mt-2">
          Added:{" "}
          {new Date(project.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        {project.project_keywords && (
          <div className="mt-2 flex flex-wrap gap-1">
            {project.project_keywords.split(",").map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full"
              >
                {kw.trim().toUpperCase()}
              </span>
            ))}
          </div>
        )}


      </div>

      <div className="absolute right-2 bottom-2 flex space-x-2">
        <a
          href={project.project_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <SquareArrowOutUpRight className="h-5 w-5 text-blue-600" />
        </a>

      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: session, status } = useSession(); // ✅ get user from NextAuth
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");


  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects", { cache: "no-store" });
      const data = await res.json();
      console.log("data", data)

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      showToast("Failed to fetch projects.");
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchProjects();  // no token needed
  }, [fetchProjects]);





  // Loading/unauthenticated state
  if (status === "loading") return <p>Loading session...</p>;


  const filteredProjects = projects.filter((p) => {
    const search = searchTerm.toLowerCase();
    return (
      p.project_name?.toLowerCase().includes(search) ||
      p.project_desc?.toLowerCase().includes(search) ||
      p.project_keywords?.toLowerCase().includes(search)
    );
  });


  return (
    <>
      <AppHeader />
      <Flex height="100vh" pt="49px" align="stretch">
        <Box>
          <LeftNav />
        </Box>
        <Separator orientation="vertical" size="4" />

        {/* ===== Main Content ===== */}
        <Box className="flex-1 overflow-y-auto p-6 bg-gray-50">



          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Projects {projects.length > 0 && `(${projects.length})`}
            </h1>

            {/* 🔍 Search Bar */}
            <div className="flex items-center gap-2 w-full sm:w-80">
              <TextField.Root
                size="3"
                radius="full"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white"
              >
                <TextField.Slot side="left">
                  <Search className="h-4 w-4 text-gray-500" />
                </TextField.Slot>
              </TextField.Root>
            </div>
          </div>


          {loading ? (
            <p className="text-gray-500">Loading projects...</p>
          ) : filteredProjects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
              {[...filteredProjects].reverse().map((p) => (
                <ProjectCard key={p?.id} project={p} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No project found.</div>
          )}
        </Box>
      </Flex>
    </>
  );
}
