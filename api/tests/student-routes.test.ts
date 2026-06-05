#!/usr/bin/env tsx

/**
 * Student Routes Test Script
 * Tests all student management endpoints with proper authentication
 */

import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "http://localhost:3000/api";

interface TestResult {
  name: string;
  method: string;
  endpoint: string;
  status: "pass" | "fail";
  statusCode?: number;
  message?: string;
  data?: any;
}

class StudentRouteTester {
  private api: AxiosInstance;
  private adminToken: string = "";
  private testStudentId: string = "";
  private results: TestResult[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Login as admin user to get authentication token
   */
  async login(email: string = "admin1@example.com", password: string = "test123456") {
    try {
      console.log("🔐 Logging in...");
      const response = await this.api.post("/auth/login", {
        email,
        password,
      });

      this.adminToken = response.data.data.token;
      this.api.defaults.headers.common["Authorization"] = `Bearer ${this.adminToken}`;

      console.log("✅ Login successful\n");
      return true;
    } catch (error: any) {
      console.error("❌ Login failed:", error.response?.data?.message || error.message);
      return false;
    }
  }

  /**
   * Test creating a student
   */
  async testCreateStudent() {
    try {
      console.log("📝 Testing: Create Student");
      const response = await this.api.post("/students/create", {
        email: `student${Date.now()}@example.com`,
        password: "password123",
        confirmPassword: "password123",
        name: "Test Student",
        location: "Test Location",
      });

      this.testStudentId = response.data.data.student.id;
      this.results.push({
        name: "Create Student",
        method: "POST",
        endpoint: "/students/create",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Student created: ${this.testStudentId}\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Create Student",
        method: "POST",
        endpoint: "/students/create",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test getting all students
   */
  async testGetAllStudents() {
    try {
      console.log("📋 Testing: Get All Students");
      const response = await this.api.get("/students/get?skip=0&take=10");

      this.results.push({
        name: "Get All Students",
        method: "GET",
        endpoint: "/students/get",
        status: "pass",
        statusCode: response.status,
        data: { count: response.data.data.data.length, total: response.data.data.pagination.total },
      });

      console.log(`✅ Retrieved ${response.data.data.data.length} students\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Get All Students",
        method: "GET",
        endpoint: "/students/get",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test getting student by ID
   */
  async testGetStudentById() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Get Student by ID (no test student)\n");
      return false;
    }

    try {
      console.log("🔍 Testing: Get Student by ID");
      const response = await this.api.get(`/students/get/${this.testStudentId}`);

      this.results.push({
        name: "Get Student by ID",
        method: "GET",
        endpoint: "/students/get/:studentId",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Retrieved student: ${response.data.data.student.name}\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Get Student by ID",
        method: "GET",
        endpoint: "/students/get/:studentId",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test updating student
   */
  async testUpdateStudent() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Update Student (no test student)\n");
      return false;
    }

    try {
      console.log("✏️ Testing: Update Student");
      const response = await this.api.put(`/students/${this.testStudentId}`, {
        studentId: this.testStudentId,
        name: "Updated Test Student",
        location: "Updated Location",
      });

      this.results.push({
        name: "Update Student",
        method: "PUT",
        endpoint: "/students/:studentId",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Student updated\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Update Student",
        method: "PUT",
        endpoint: "/students/:studentId",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test getting student stats
   */
  async testGetStudentStats() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Get Student Stats (no test student)\n");
      return false;
    }

    try {
      console.log("📊 Testing: Get Student Stats");
      const response = await this.api.get(`/students/stats/${this.testStudentId}`);

      this.results.push({
        name: "Get Student Stats",
        method: "GET",
        endpoint: "/students/stats/:studentId",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Retrieved stats\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Get Student Stats",
        method: "GET",
        endpoint: "/students/stats/:studentId",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test creating a study plan
   */
  async testCreateStudyPlan() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Create Study Plan (no test student)\n");
      return false;
    }

    try {
      console.log("📚 Testing: Create Study Plan");
      const response = await this.api.post("/students/study-plan/create", {
        studentId: this.testStudentId,
        subject: "Clinical Chemistry",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      this.results.push({
        name: "Create Study Plan",
        method: "POST",
        endpoint: "/students/study-plan/create",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Study plan created\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Create Study Plan",
        method: "POST",
        endpoint: "/students/study-plan/create",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test recording exam result
   */
  async testRecordExamResult() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Record Exam Result (no test student)\n");
      return false;
    }

    try {
      console.log("📝 Testing: Record Exam Result");
      const response = await this.api.post("/students/exam/record", {
        studentId: this.testStudentId,
        score: 85,
        total: 100,
        subject: "Clinical Chemistry",
      });

      this.results.push({
        name: "Record Exam Result",
        method: "POST",
        endpoint: "/students/exam/record",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Exam result recorded\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Record Exam Result",
        method: "POST",
        endpoint: "/students/exam/record",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test awarding achievement
   */
  async testAwardAchievement() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Award Achievement (no test student)\n");
      return false;
    }

    try {
      console.log("🏆 Testing: Award Achievement");
      const response = await this.api.post("/students/achievement/award", {
        studentId: this.testStudentId,
        task: "Complete first lesson",
        type: "quest",
        xp: 100,
        badge: "first-lesson",
        subject: "Clinical Chemistry",
      });

      this.results.push({
        name: "Award Achievement",
        method: "POST",
        endpoint: "/students/achievement/award",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Achievement awarded\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Award Achievement",
        method: "POST",
        endpoint: "/students/achievement/award",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test recording lesson completion
   */
  async testRecordLessonCompletion() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Record Lesson Completion (no test student)\n");
      return false;
    }

    try {
      console.log("✅ Testing: Record Lesson Completion");
      const response = await this.api.post("/students/lesson/record", {
        studentId: this.testStudentId,
        subject: "Clinical Chemistry",
        lessonId: "cc-lesson-001",
        status: "completed",
      });

      this.results.push({
        name: "Record Lesson Completion",
        method: "POST",
        endpoint: "/students/lesson/record",
        status: "pass",
        statusCode: response.status,
        data: response.data.data,
      });

      console.log(`✅ Lesson completion recorded\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Record Lesson Completion",
        method: "POST",
        endpoint: "/students/lesson/record",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Test deleting student
   */
  async testDeleteStudent() {
    if (!this.testStudentId) {
      console.log("⚠️ Skipping: Delete Student (no test student)\n");
      return false;
    }

    try {
      console.log("🗑️ Testing: Delete Student");
      const response = await this.api.delete(`/students/${this.testStudentId}`);

      this.results.push({
        name: "Delete Student",
        method: "DELETE",
        endpoint: "/students/:studentId",
        status: "pass",
        statusCode: response.status,
      });

      console.log(`✅ Student deleted\n`);
      return true;
    } catch (error: any) {
      this.results.push({
        name: "Delete Student",
        method: "DELETE",
        endpoint: "/students/:studentId",
        status: "fail",
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.message,
      });

      console.error("❌ Failed:", error.response?.data?.message || error.message, "\n");
      return false;
    }
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(80) + "\n");

    const passed = this.results.filter((r) => r.status === "pass").length;
    const failed = this.results.filter((r) => r.status === "fail").length;

    this.results.forEach((result) => {
      const icon = result.status === "pass" ? "✅" : "❌";
      console.log(`${icon} ${result.name.padEnd(30)} [${result.method.padEnd(6)}] ${result.endpoint}`);
      if (result.message) {
        console.log(`   Error: ${result.message}`);
      }
    });

    console.log("\n" + "-".repeat(80));
    console.log(`Total: ${this.results.length} tests | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
    console.log("=".repeat(80) + "\n");
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("\n" + "=".repeat(80));
    console.log("🧪 STUDENT ROUTES TEST SUITE");
    console.log("=".repeat(80) + "\n");

    // Login first
    const loggedIn = await this.login();
    if (!loggedIn) {
      console.error("Cannot proceed without login");
      return;
    }

    // Run all tests
    await this.testCreateStudent();
    await this.testGetAllStudents();
    await this.testGetStudentById();
    await this.testUpdateStudent();
    await this.testGetStudentStats();
    await this.testCreateStudyPlan();
    await this.testRecordExamResult();
    await this.testAwardAchievement();
    await this.testRecordLessonCompletion();
    await this.testDeleteStudent();

    // Print results
    this.printResults();
  }
}

// Run tests
const tester = new StudentRouteTester();
tester.runAllTests().catch(console.error);
