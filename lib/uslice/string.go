package uslice

func StringIn(obj string, objs []string) bool {
	for _, item := range objs {
		if item == obj {
			return true
		}
	}
	return false
}
