import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from "sequelize";
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Project extends Model<InferAttributes<Project>, InferCreationAttributes<Project>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare projectId: ForeignKey<Project["id"]>;
  declare title: string;
  declare description: CreationOptional<string | null>;
  declare status: CreationOptional<TaskStatus>;
  declare dueDate: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initModels(sequelize: Sequelize) {
  const id = { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true } as const;
  const timestamps = { createdAt: DataTypes.DATE, updatedAt: DataTypes.DATE };

  User.init(
    {
      id,
      name: { type: DataTypes.STRING(100), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(100), allowNull: false },
      ...timestamps,
    },
    { sequelize, tableName: "users" },
  );

  Project.init(
    {
      id,
      title: { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      ...timestamps,
    },
    { sequelize, tableName: "projects" },
  );

  Task.init(
    {
      id,
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      // enum order is what "sort by status" uses
      status: { type: DataTypes.ENUM(...TASK_STATUSES), allowNull: false, defaultValue: "todo" },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
      ...timestamps,
    },
    {
      sequelize,
      tableName: "tasks",
      indexes: [{ fields: ["projectId", "status"] }, { fields: ["projectId", "dueDate"] }],
    },
  );

  User.hasMany(Project, { foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" });
  Project.belongsTo(User, { foreignKey: { name: "userId", allowNull: false }, onDelete: "CASCADE" });
  Project.hasMany(Task, { foreignKey: { name: "projectId", allowNull: false }, onDelete: "CASCADE" });
  Task.belongsTo(Project, { foreignKey: { name: "projectId", allowNull: false }, onDelete: "CASCADE" });
}
