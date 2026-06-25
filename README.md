# mcp-server-terraform

MCP server for Terraform infrastructure-as-code operations. Lets AI assistants manage Terraform workflows — plan, apply, destroy, and inspect infrastructure state.

## Tools

| Tool | Description |
|------|-------------|
| `terraform_plan` | Preview changes without applying |
| `terraform_apply` | Apply infrastructure changes |
| `terraform_destroy` | Destroy managed infrastructure |
| `terraform_init` | Initialize working directory, download providers |
| `terraform_validate` | Validate configuration syntax |
| `terraform_state_list` | List resources in state |
| `terraform_state_show` | Show resource attributes from state |
| `terraform_fmt` | Format HCL files to canonical style |
| `terraform_output` | Show output values from state |
| `terraform_import` | Import existing resources into state |

## Installation

```bash
npm install -g mcp-server-terraform
```

## Usage

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "terraform": {
      "command": "mcp-server-terraform"
    }
  }
}
```

## Requirements

- Terraform CLI installed and in PATH
- Working directory with `.tf` files for the target infrastructure

## License

MIT
