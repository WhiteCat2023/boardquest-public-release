/**
 * Dedicated Prisma Enums and Type Definitions Replicated from Prisma Schema
 * Centralized, self-contained type system eliminating brittle relative imports to generated output.
 */
export var Role;
(function (Role) {
    Role["SUPERADMIN"] = "SUPERADMIN";
    Role["DEAN"] = "DEAN";
    Role["TEAMLEAD"] = "TEAMLEAD";
    Role["TEACHER"] = "TEACHER";
    Role["EXTERNAL"] = "EXTERNAL";
})(Role || (Role = {}));
export var QuestionDifficulty;
(function (QuestionDifficulty) {
    QuestionDifficulty["EASY"] = "EASY";
    QuestionDifficulty["MEDIUM"] = "MEDIUM";
    QuestionDifficulty["HARD"] = "HARD";
})(QuestionDifficulty || (QuestionDifficulty = {}));
export var QuestionType;
(function (QuestionType) {
    QuestionType["MCQ"] = "MCQ";
    QuestionType["TRUE_FALSE"] = "TRUE_FALSE";
    QuestionType["SHORT_ANSWER"] = "SHORT_ANSWER";
})(QuestionType || (QuestionType = {}));
export var RequestStatus;
(function (RequestStatus) {
    RequestStatus["PENDING"] = "PENDING";
    RequestStatus["APPROVED"] = "APPROVED";
    RequestStatus["DECLINED"] = "DECLINED";
})(RequestStatus || (RequestStatus = {}));
export var GuidanceStatus;
(function (GuidanceStatus) {
    GuidanceStatus["PENDING"] = "PENDING";
    GuidanceStatus["IN_PROGRESS"] = "IN_PROGRESS";
    GuidanceStatus["RESOLVED"] = "RESOLVED";
    GuidanceStatus["CANCELLED"] = "CANCELLED";
})(GuidanceStatus || (GuidanceStatus = {}));
export var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["DEACTIVATED"] = "DEACTIVATED";
})(AccountStatus || (AccountStatus = {}));
